// Translator API Utilities for different providers
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProviderType } from '../context/ProviderContext';

// Interface for translation request
export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
  additionalText?: string;  // Optional field for additional text when sending image + text
}

// Interface for translation response
export interface TranslationResponse {
  translatedText: string;
  success: boolean;
  error?: string;
  response?: any; // Add response field to store the raw API response
  providerInfo?: {
    provider: ProviderType;
    model: string;
  };
}

// Standard translation prompt template used across all providers
export const TRANSLATION_PROMPT = `Translate the following content from \${fromLanguage} to \${toLanguage}.

**Instructions:**

* **Content Type:** Determine if the input is text or an image.
* **Text Input:** If text, perform a direct and accurate translation.
* **Image Input:** If an image, analyze the image to identify and extract all text present within it. Then, translate the extracted text.
* **Markdown Formatting:** Apply proper markdown formatting to the translated text to enhance readability.

**Output:** Provide only the translated text, formatted with markdown. No additional text or explanations are needed.

**Content to Translate:** \${text}`;

// Get API key and model for a specific provider
export const getProviderConfig = async (provider: ProviderType): Promise<{apiKey: string, model: string}> => {
  try {
    const apiKey = await AsyncStorage.getItem(`${provider}_api_key`);
    const model = await AsyncStorage.getItem(`${provider}_model`);
    
    return {
      apiKey: apiKey || '',
      model: model || getDefaultModel(provider)
    };
  } catch (error) {
    console.error(`Error getting ${provider} config:`, error);
    return {
      apiKey: '',
      model: getDefaultModel(provider)
    };
  }
};

// Get default model for a provider
export const getDefaultModel = (provider: ProviderType): string => {
  const DEFAULT_MODELS: Record<ProviderType, string> = {
    openai: "gpt-3.5-turbo",
    google: "gemini-1.5-flash",
    anthropic: "claude-3-opus-20240229",
    openrouter: "deepseek/deepseek-r1:free",
    groq: "llama3-8b-8192"
  };
  
  return DEFAULT_MODELS[provider];
};

// Helper function to check if input is a base64 image
const isBase64Image = (text: string): boolean => {
  return text.startsWith('data:image/') && text.includes(';base64,');
};

// Helper function to format messages for image + text input
const formatCombinedInput = (base64Image: string, additionalText: string | undefined) => {
  if (!additionalText) {
    return [{ type: "image_url", image_url: { url: base64Image } }];
  }
  return [
    { type: "text", text: "Image content:" },
    { type: "image_url", image_url: { url: base64Image } },
    { type: "text", text: "Additional text: " + additionalText }
  ];
};

// Translate text using OpenAI
export const translateWithOpenAI = async (
  request: TranslationRequest,
  apiKey: string,
  model: string
): Promise<TranslationResponse> => {
  try {
    // Check if the input is an image
    const isImage = isBase64Image(request.text);
    
    let requestBody;
    
    if (isImage) {
      // For image input (with or without additional text)
      requestBody = {
        model: "gpt-4-vision-preview", // Force vision model for image analysis
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: TRANSLATION_PROMPT
                  .replace('\${fromLanguage}', request.fromLanguage)
                  .replace('\${toLanguage}', request.toLanguage)
                  .replace('\${text}', "")
              },
              ...formatCombinedInput(request.text, request.additionalText)
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 8192
      };
    } else {
      // For text-only input
      requestBody = {
        model: model,
        messages: [
          {
            role: "user",
            content: TRANSLATION_PROMPT
              .replace('\${fromLanguage}', request.fromLanguage)
              .replace('\${toLanguage}', request.toLanguage)
              .replace('\${text}', request.text)
          }
        ],
        temperature: 0.3,
        max_tokens: 8192
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.status === 200 && data.choices && data.choices[0]) {
      return {
        translatedText: data.choices[0].message.content.trim(),
        success: true,
        providerInfo: {
          provider: 'openai' as ProviderType,
          model: model
        }
      };
    } else {
      // Check for specific error types
      const errorMessage = data.error?.message || 'Unknown error';
      
      // Check if error is related to image capability
      const isImageCapabilityError = isImage && 
        (errorMessage.includes('does not support vision') || 
         errorMessage.includes('image input') || 
         errorMessage.includes('multimodal'));
      
      if (isImageCapabilityError) {
        throw new Error(`The selected model "${model}" does not support image analysis. Please select a model with vision capabilities like "gpt-4-vision".`);
      } else if (errorMessage.includes('authentication') || errorMessage.includes('invalid api key') || errorMessage.includes('key')) {
        throw new Error(`Authentication error with OpenAI API: ${errorMessage}. Please check your API key.`);
      } else if (errorMessage.includes('model') || errorMessage.includes('not found')) {
        throw new Error(`Model error with OpenAI API: ${errorMessage}. The model "${model}" may not be available.`);
      } else if (errorMessage.includes('rate') || errorMessage.includes('limit') || errorMessage.includes('capacity')) {
        throw new Error(`Rate limit exceeded with OpenAI API: ${errorMessage}. Please try again later.`);
      } else if (errorMessage.includes('content') || errorMessage.includes('policy') || errorMessage.includes('flagged')) {
        throw new Error(`Content policy violation with OpenAI API: ${errorMessage}. Please modify your input.`);
      } else {
        throw new Error(errorMessage);
      }
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null,
      providerInfo: {
        provider: 'openai' as ProviderType,
        model: model
      }
    };
  }
};

// Translate text using Google Gemini
export const translateWithGoogle = async (
  request: TranslationRequest,
  apiKey: string,
  model: string
): Promise<TranslationResponse> => {
  try {
    const isImage = isBase64Image(request.text);
    
    let requestBody;
    
    if (isImage) {
      // For image input (with or without additional text)
      const parts = [
        {
          text: TRANSLATION_PROMPT
            .replace('\${fromLanguage}', request.fromLanguage)
            .replace('\${toLanguage}', request.toLanguage)
            .replace('\${text}', "")
        },
        {
          inline_data: {
            mime_type: request.text.split(';')[0].split(':')[1],
            data: request.text.split(',')[1]
          }
        }
      ];

      if (request.additionalText) {
        parts.push({
          text: "Additional text to translate: " + request.additionalText
        });
      }

      requestBody = {
        contents: [{
          parts
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192
        }
      };
    } else {
      // For text-only input
      requestBody = {
        contents: [{
          parts: [{
            text: TRANSLATION_PROMPT
              .replace('\${fromLanguage}', request.fromLanguage)
              .replace('\${toLanguage}', request.toLanguage)
              .replace('\${text}', request.text)
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192
        }
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();

    if (response.status === 200 && data.candidates && data.candidates[0]) {
      return {
        translatedText: data.candidates[0].content.parts[0].text.trim(),
        success: true,
        providerInfo: {
          provider: 'google' as ProviderType,
          model: model
        }
      };
    } else {
      // Check for specific error types
      const errorMessage = data.error?.message || 'Unknown error';
      const errorCode = data.error?.code || 0;
      
      // Check if error is related to image capability
      const isImageCapabilityError = isImage && 
        (errorMessage.includes('multimodal') || 
         errorMessage.includes('image') || 
         errorMessage.includes('vision'));
      
      if (isImageCapabilityError) {
        throw new Error(`The selected model "${model}" does not support image analysis. Please select a model with multimodal capabilities like "gemini-1.5-pro".`);
      } else if (errorCode === 401 || errorMessage.includes('API key') || errorMessage.includes('auth')) {
        throw new Error(`Authentication error with Google API: ${errorMessage}. Please check your API key.`);
      } else if (errorCode === 404 || errorMessage.includes('model') || errorMessage.includes('not found')) {
        throw new Error(`Model error with Google API: ${errorMessage}. The model "${model}" may not be available.`);
      } else if (errorCode === 429 || errorMessage.includes('quota') || errorMessage.includes('rate')) {
        throw new Error(`Rate limit exceeded with Google API: ${errorMessage}. Please try again later.`);
      } else if (errorCode === 400 || errorMessage.includes('safety') || errorMessage.includes('blocked')) {
        throw new Error(`Content policy violation with Google API: ${errorMessage}. Please modify your input.`);
      } else {
        throw new Error(`Google API error (${errorCode}): ${errorMessage}`);
      }
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null,
      providerInfo: {
        provider: 'google' as ProviderType,
        model: model
      }
    };
  }
};

// Translate text using Anthropic
export const translateWithAnthropic = async (
  request: TranslationRequest,
  apiKey: string,
  model: string
): Promise<TranslationResponse> => {
  try {
    const isImage = isBase64Image(request.text);
    
    let requestBody;
    
    if (isImage) {
      // For image input (with or without additional text)
      const content = [
        {
          type: "text",
          text: TRANSLATION_PROMPT
            .replace('\${fromLanguage}', request.fromLanguage)
            .replace('\${toLanguage}', request.toLanguage)
            .replace('\${text}', "")
        },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: request.text.split(';')[0].split(':')[1],
            data: request.text.split(',')[1]
          }
        }
      ];

      if (request.additionalText) {
        content.push({
          type: "text",
          text: "Additional text to translate: " + request.additionalText
        });
      }

      requestBody = {
        model: "claude-3-opus-20240229",
        max_tokens: 8192,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content
          }
        ]
      };
    } else {
      // For text-only input
      requestBody = {
        model: model,
        max_tokens: 8192,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: TRANSLATION_PROMPT
              .replace('\${fromLanguage}', request.fromLanguage)
              .replace('\${toLanguage}', request.toLanguage)
              .replace('\${text}', request.text)
          }
        ]
      };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.status === 200 && data.content && data.content.length > 0) {
      return {
        translatedText: data.content[0].text.trim(),
        success: true,
        providerInfo: {
          provider: 'anthropic' as ProviderType,
          model: model
        }
      };
    } else {
      // Check for specific error types
      const errorMessage = data.error?.message || 'Unknown error';
      const errorType = data.error?.type || '';
      
      // Check if error is related to image capability
      const isImageCapabilityError = isImage && 
        (errorMessage.includes('vision') || 
         errorMessage.includes('image') || 
         errorMessage.includes('multimodal'));
      
      if (isImageCapabilityError) {
        throw new Error(`The selected model "${model}" does not support image analysis. Please select a model with vision capabilities like "claude-3-opus".`);
      } else if (errorType === 'authentication_error' || errorMessage.includes('api key') || errorMessage.includes('auth')) {
        throw new Error(`Authentication error with Anthropic API: ${errorMessage}. Please check your API key.`);
      } else if (errorType === 'invalid_request_error' && errorMessage.includes('model')) {
        throw new Error(`Model error with Anthropic API: ${errorMessage}. The model "${model}" may not be available.`);
      } else if (errorType === 'rate_limit_error' || errorMessage.includes('rate')) {
        throw new Error(`Rate limit exceeded with Anthropic API: ${errorMessage}. Please try again later.`);
      } else if (errorType === 'content_policy_violation' || errorMessage.includes('content')) {
        throw new Error(`Content policy violation with Anthropic API: ${errorMessage}. Please modify your input.`);
      } else {
        throw new Error(`Anthropic API error (${errorType}): ${errorMessage}`);
      }
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null,
      providerInfo: {
        provider: 'anthropic' as ProviderType,
        model: model
      }
    };
  }
};

// Translate text using OpenRouter
export const translateWithOpenRouter = async (
  request: TranslationRequest,
  apiKey: string,
  model: string
): Promise<TranslationResponse> => {
  try {
    const isImage = isBase64Image(request.text);
    
    let requestBody;
    
    if (isImage) {
      // For image input (with or without additional text)
      requestBody = {
        model: model.includes('gpt-4') ? 'openai/gpt-4-vision-preview' : model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: TRANSLATION_PROMPT
                  .replace('\${fromLanguage}', request.fromLanguage)
                  .replace('\${toLanguage}', request.toLanguage)
                  .replace('\${text}', "")
              },
              ...formatCombinedInput(request.text, request.additionalText)
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 8192
      };
    } else {
      // For text-only input
      requestBody = {
        model: model,
        messages: [
          {
            role: "user",
            content: TRANSLATION_PROMPT
              .replace('\${fromLanguage}', request.fromLanguage)
              .replace('\${toLanguage}', request.toLanguage)
              .replace('\${text}', request.text)
          }
        ],
        temperature: 0.2,
        max_tokens: 8192
      };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ai-t-hub.app'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.status === 200 && data.choices && data.choices[0]) {
      return {
        translatedText: data.choices[0].message.content.trim(),
        success: true,
        providerInfo: {
          provider: 'openrouter' as ProviderType,
          model: model
        }
      };
    } else {
      // Check for specific error types
      const errorMessage = data.error?.message || 'Unknown error';
      const errorType = data.error?.type || '';
      
      // Check if error is related to image capability
      const isImageCapabilityError = isImage && 
        (errorMessage.includes('vision') || 
         errorMessage.includes('image') || 
         errorMessage.includes('multimodal'));
      
      if (isImageCapabilityError) {
        throw new Error(`The selected model "${model}" does not support image analysis. Please select a model with vision capabilities.`);
      } else if (errorType === 'invalid_api_key' || errorMessage.includes('api key') || errorMessage.includes('auth')) {
        throw new Error(`Authentication error with OpenRouter API: ${errorMessage}. Please check your API key.`);
      } else if (errorType === 'model_not_found' || errorMessage.includes('model')) {
        throw new Error(`Model error with OpenRouter API: ${errorMessage}. The model "${model}" may not be available.`);
      } else if (errorType === 'rate_limit_exceeded' || errorMessage.includes('rate')) {
        throw new Error(`Rate limit exceeded with OpenRouter API: ${errorMessage}. Please try again later.`);
      } else if (errorType === 'content_filter' || errorMessage.includes('content')) {
        throw new Error(`Content policy violation with OpenRouter API: ${errorMessage}. Please modify your input.`);
      } else {
        throw new Error(`OpenRouter API error (${errorType}): ${errorMessage}`);
      }
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null,
      providerInfo: {
        provider: 'openrouter' as ProviderType,
        model: model
      }
    };
  }
};

// Translate text using Groq
export const translateWithGroq = async (
  request: TranslationRequest,
  apiKey: string,
  model: string
): Promise<TranslationResponse> => {
  try {
    // Check if the input is an image (base64 string)
    const isImage = isBase64Image(request.text);
    
    // Groq currently doesn't support image input directly
    if (isImage) {
      throw new Error(`Groq API currently doesn't support image analysis. Please use a text-only input or try a different provider for image translation.`);
    }
    
    // For text input, use standard completion
    const requestBody = {
      model: model,
      messages: [
        {
          role: "user",
          content: TRANSLATION_PROMPT
            .replace('\${fromLanguage}', request.fromLanguage)
            .replace('\${toLanguage}', request.toLanguage)
            .replace('\${text}', request.text)
        }
      ],
      temperature: 0.2,
      max_tokens: 8192
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.status === 200 && data.choices && data.choices[0]) {
      return {
        translatedText: data.choices[0].message.content.trim(),
        success: true,
        providerInfo: {
          provider: 'groq' as ProviderType,
          model: model
        }
      };
    } else {
      // Provide more detailed error information
      const errorMessage = data.error?.message || 'Unknown error';
      
      // Check for common API errors
      if (errorMessage.includes('authentication') || errorMessage.includes('auth') || errorMessage.includes('key')) {
        throw new Error(`Authentication error with Groq API: ${errorMessage}. Please check your API key.`);
      } else if (errorMessage.includes('model') || errorMessage.includes('not found')) {
        throw new Error(`Model error with Groq API: ${errorMessage}. The model "${model}" may not be available.`);
      } else if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
        throw new Error(`Rate limit exceeded with Groq API: ${errorMessage}. Please try again later.`);
      } else {
        throw new Error(errorMessage);
      }
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null,
      providerInfo: {
        provider: 'groq' as ProviderType,
        model: model
      }
    };
  }
};

// Main translation function that selects the appropriate provider
export const translateText = async (
  request: TranslationRequest,
  provider: ProviderType
): Promise<TranslationResponse> => {
  try {
    const { apiKey, model } = await getProviderConfig(provider);
    
    if (!apiKey) {
      return {
        translatedText: '',
        success: false,
        error: `No API key found for ${provider}. Please add your API key in the settings.`,
        providerInfo: {
          provider,
          model
        }
      };
    }
    
    let result: TranslationResponse;
    
    switch (provider) {
      case 'openai':
        result = await translateWithOpenAI(request, apiKey, model);
        break;
      case 'google':
        result = await translateWithGoogle(request, apiKey, model);
        break;
      case 'anthropic':
        result = await translateWithAnthropic(request, apiKey, model);
        break;
      case 'openrouter':
        result = await translateWithOpenRouter(request, apiKey, model);
        break;
      case 'groq':
        result = await translateWithGroq(request, apiKey, model);
        break;
      default:
        return {
          translatedText: '',
          success: false,
          error: `Unsupported provider: ${provider}`,
          providerInfo: {
            provider,
            model
          }
        };
    }
    
    // Provider info is already added in each provider function
    return result;
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: `Unexpected error: ${error.message}`,
      response: error.response || null,
      providerInfo: {
        provider,
        model: getDefaultModel(provider)
      }
    };
  }
};

// Add a default export to satisfy Expo Router
export default function TranslatorApiUtils() {
  return null; // This component is never rendered
} 