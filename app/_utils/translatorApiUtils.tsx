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
  response?: any;
  providerInfo?: {
    provider: ProviderType;
    model: string;
  };
}

// Standard translation prompt templates for different scenarios
const TRANSLATION_PROMPTS = {
  imageOnly: `Analyze the following image and translate any text or content from \${fromLanguage} to \${toLanguage}. 
If the content contains a table or structured data:
1. Preserve the table format using markdown or plaintext alignment
2. Ensure all columns are properly aligned
3. Maintain consistent spacing between elements
4. Keep numbers right-aligned
5. Wrap long text within reasonable width (max 35 characters per cell)`,

  imageWithText: `Translate the following content from \${fromLanguage} to \${toLanguage}. \${additionalText}
If the content contains a table or structured data:
1. Preserve the table format using markdown or plaintext alignment
2. Ensure all columns are properly aligned
3. Maintain consistent spacing between elements
4. Keep numbers right-aligned
5. Wrap long text within reasonable width (max 35 characters per cell)`,

  textOnly: `Translate the following text from \${fromLanguage} to \${toLanguage}. 
If the content contains a table or structured data:
1. Preserve the table format using markdown or plaintext alignment
2. Ensure all columns are properly aligned
3. Maintain consistent spacing between elements
4. Keep numbers right-aligned
5. Wrap long text within reasonable width (max 35 characters per cell)

Text to translate:
\${text}`
};

// Helper functions for translation
const isBase64Image = (text: string): boolean => {
  return text.startsWith('data:image/') && text.includes(';base64,');
};

// Helper function to format table-like responses
const formatTableResponse = (text: string): string => {
  // Split into lines
  const lines = text.split('\n');
  
  // Check if this looks like a table (contains multiple spaces or | characters)
  const isTable = lines.some(line => line.includes('|') || line.match(/\s{3,}/));
  
  if (!isTable) return text;

  // Process each line
  return lines.map(line => {
    // If line is too long, add line breaks at appropriate points
    if (line.length > 40) {
      const parts = line.split(/(\s{2,}|\|)/);
      let currentLength = 0;
      let formattedLine = '';
      
      parts.forEach(part => {
        if (currentLength + part.length > 40) {
          formattedLine += '\n  ' + part;
          currentLength = 2 + part.length;
        } else {
          formattedLine += part;
          currentLength += part.length;
        }
      });
      
      return formattedLine;
    }
    return line;
  }).join('\n');
};

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

// Translate using OpenAI
const translateWithOpenAI = async (
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
          text: request.additionalText
            ? TRANSLATION_PROMPTS.imageWithText
                .replace('${fromLanguage}', request.fromLanguage)
                .replace('${toLanguage}', request.toLanguage)
                .replace('${additionalText}', request.additionalText)
            : TRANSLATION_PROMPTS.imageOnly
                .replace('${fromLanguage}', request.fromLanguage)
                .replace('${toLanguage}', request.toLanguage)
        },
        {
          type: "image_url",
          image_url: {
            url: request.text
          }
        }
      ];

      requestBody = {
        model: model,
        messages: [{ 
          role: "user", 
          content
        }],
        temperature: 0.3,
        max_tokens: 7999
      };
    } else {
      // For text-only input
      requestBody = {
        model: model,
        messages: [{ 
          role: "user", 
          content: TRANSLATION_PROMPTS.textOnly
            .replace('${fromLanguage}', request.fromLanguage)
            .replace('${toLanguage}', request.toLanguage)
            .replace('${text}', request.text)
        }],
        temperature: 0.3,
        max_tokens: 7999
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
        translatedText: formatTableResponse(data.choices[0].message.content.trim()),
        success: true,
        providerInfo: {
          provider: 'openai',
          model: model
        }
      };
    } else {
      const errorMessage = data.error?.message || 'Unknown error';
      
      if (isImage && errorMessage.includes('vision')) {
        throw new Error(`The selected model "${model}" does not support image analysis. Please select a model with vision capabilities like "gpt-4-vision-preview".`);
      } else if (errorMessage.includes('authentication')) {
        throw new Error(`Authentication error: ${errorMessage}. Please check your API key.`);
      } else if (errorMessage.includes('model')) {
        throw new Error(`Model error: ${errorMessage}. The model "${model}" may not be available.`);
      }
      
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message
    };
  }
};

// Translate text using Google Gemini
const translateWithGoogle = async (
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
          text: request.additionalText
            ? TRANSLATION_PROMPTS.imageWithText
                .replace('${fromLanguage}', request.fromLanguage)
                .replace('${toLanguage}', request.toLanguage)
                .replace('${additionalText}', request.additionalText)
            : TRANSLATION_PROMPTS.imageOnly
                .replace('${fromLanguage}', request.fromLanguage)
                .replace('${toLanguage}', request.toLanguage)
        },
        {
          inline_data: {
            mime_type: request.text.split(';')[0].split(':')[1],
            data: request.text.split(',')[1]
          }
        }
      ];

      requestBody = {
        contents: [{
          parts
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 7999,
          topP: 0.8,
          topK: 40
        }
      };
    } else {
      // For text-only input
      requestBody = {
        contents: [{
          parts: [{
            text: TRANSLATION_PROMPTS.textOnly
              .replace('${fromLanguage}', request.fromLanguage)
              .replace('${toLanguage}', request.toLanguage)
              .replace('${text}', request.text)
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 7999,
          topP: 0.8,
          topK: 40
        }
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.status === 200 && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        translatedText: formatTableResponse(data.candidates[0].content.parts[0].text.trim()),
        success: true,
        providerInfo: {
          provider: 'google',
          model: model
        }
      };
    } else {
      const errorMessage = data.error?.message || 'Unknown error';
      const errorCode = data.error?.code || 500;
      
      if (isImage && (errorMessage.includes('vision') || errorMessage.includes('image'))) {
        throw new Error(`The selected model "${model}" does not support image analysis. Please select a model with multimodal capabilities like "gemini-1.5-pro-vision" or "gemini-1.5-flash".`);
      } else if (errorCode === 401 || errorMessage.includes('API key')) {
        throw new Error(`Authentication error: ${errorMessage}. Please check your API key.`);
      } else if (errorCode === 404 || errorMessage.includes('model')) {
        throw new Error(`Model error: ${errorMessage}. The model "${model}" may not be available.`);
      } else if (errorCode === 400 && errorMessage.includes('inline_data')) {
        throw new Error(`Image format error: The image data must be in base64 format with a valid MIME type.`);
      }
      
      throw new Error(`Google API error (${errorCode}): ${errorMessage}`);
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message
    };
  }
};

// Translate text using Anthropic
const translateWithAnthropic = async (
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
          text: request.additionalText
            ? TRANSLATION_PROMPTS.imageWithText
                .replace('${fromLanguage}', request.fromLanguage)
                .replace('${toLanguage}', request.toLanguage)
                .replace('${additionalText}', request.additionalText)
            : TRANSLATION_PROMPTS.imageOnly
                .replace('${fromLanguage}', request.fromLanguage)
                .replace('${toLanguage}', request.toLanguage)
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

      requestBody = {
        model: model,
        max_tokens: 7999,
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
        max_tokens: 7999,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: TRANSLATION_PROMPTS.textOnly
                  .replace('${fromLanguage}', request.fromLanguage)
                  .replace('${toLanguage}', request.toLanguage)
                  .replace('${text}', request.text)
              }
            ]
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

    if (response.status === 200 && data.content && data.content[0]) {
      return {
        translatedText: formatTableResponse(data.content[0].text.trim()),
        success: true,
        providerInfo: {
          provider: 'anthropic',
          model: model
        }
      };
    } else {
      const errorMessage = data.error?.message || 'Unknown error';
      const errorType = data.error?.type || 'unknown';
      
      if (isImage && (errorMessage.includes('vision') || errorMessage.includes('image'))) {
        throw new Error(`The selected model "${model}" does not support image analysis. Please select a model with vision capabilities like "claude-3-opus-20240229" or "claude-3-sonnet-20240229".`);
      } else if (errorType === 'authentication_error' || errorMessage.includes('api key')) {
        throw new Error(`Authentication error: ${errorMessage}. Please check your API key.`);
      } else if (errorType === 'invalid_request_error' && errorMessage.includes('model')) {
        throw new Error(`Model error: ${errorMessage}. The model "${model}" may not be available.`);
      } else if (errorType === 'invalid_request_error' && errorMessage.includes('image')) {
        throw new Error(`Image format error: The image data must be in base64 format with a valid MIME type.`);
      }
      
      throw new Error(`Anthropic API error (${errorType}): ${errorMessage}`);
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message
    };
  }
};

// Translate text using OpenRouter
const translateWithOpenRouter = async (
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
          text: request.additionalText
            ? TRANSLATION_PROMPTS.imageWithText
                .replace('${fromLanguage}', request.fromLanguage)
                .replace('${toLanguage}', request.toLanguage)
                .replace('${additionalText}', request.additionalText)
            : TRANSLATION_PROMPTS.imageOnly
                .replace('${fromLanguage}', request.fromLanguage)
                .replace('${toLanguage}', request.toLanguage)
        },
        {
          type: "image_url",
          image_url: {
            url: request.text
          }
        }
      ];

      requestBody = {
        model: model,
        messages: [{
          role: "user",
          content
        }],
        temperature: 0.3,
        max_tokens: 7999
      };
    } else {
      // For text-only input
      requestBody = {
        model: model,
        messages: [{
          role: "user",
          content: TRANSLATION_PROMPTS.textOnly
            .replace('${fromLanguage}', request.fromLanguage)
            .replace('${toLanguage}', request.toLanguage)
            .replace('${text}', request.text)
        }],
        temperature: 0.3,
        max_tokens: 7999
      };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/MohammedRehanAlam/AI-THub'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.status === 200 && data.choices && data.choices[0]) {
      return {
        translatedText: formatTableResponse(data.choices[0].message.content.trim()),
        success: true,
        providerInfo: {
          provider: 'openrouter',
          model: model
        }
      };
    } else {
      const errorMessage = data.error?.message || 'Unknown error';
      const errorType = data.error?.type || 'unknown';
      
      if (isImage && errorMessage.includes('vision')) {
        throw new Error(`The selected model "${model}" does not support image analysis. Please select a model with vision capabilities like "openai/gpt-4-vision-preview".`);
      } else if (errorType === 'authentication_error' || errorMessage.includes('api key')) {
        throw new Error(`Authentication error: ${errorMessage}. Please check your API key.`);
      } else if (errorType === 'invalid_request_error' && errorMessage.includes('model')) {
        throw new Error(`Model error: ${errorMessage}. The model "${model}" may not be available.`);
      } else if (errorType === 'invalid_request_error' && errorMessage.includes('image')) {
        throw new Error(`Image format error: The image data must be in base64 format with a valid MIME type.`);
      }
      
      throw new Error(`OpenRouter API error (${errorType}): ${errorMessage}`);
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message
    };
  }
};

// Translate text using Groq
const translateWithGroq = async (
  request: TranslationRequest,
  apiKey: string,
  model: string
): Promise<TranslationResponse> => {
  try {
    const isImage = isBase64Image(request.text);
    
    // Groq doesn't support image analysis yet
    if (isImage) {
      throw new Error('Groq does not currently support image analysis. Please use a text-only input or choose a different provider for image translation.');
    }

    const requestBody = {
      model: model,
      messages: [{
        role: "user",
        content: TRANSLATION_PROMPTS.textOnly
          .replace('${fromLanguage}', request.fromLanguage)
          .replace('${toLanguage}', request.toLanguage)
          .replace('${text}', request.text)
      }],
      temperature: 0.3,
      max_tokens: 7999
    };

    const response = await fetch('https://api.groq.com/v1/chat/completions', {
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
        translatedText: formatTableResponse(data.choices[0].message.content.trim()),
        success: true,
        providerInfo: {
          provider: 'groq',
          model: model
        }
      };
    } else {
      const errorMessage = data.error?.message || 'Unknown error';
      const errorType = data.error?.type || 'unknown';
      
      if (errorType === 'authentication_error' || errorMessage.includes('api key')) {
        throw new Error(`Authentication error: ${errorMessage}. Please check your API key.`);
      } else if (errorType === 'invalid_request_error' && errorMessage.includes('model')) {
        throw new Error(`Model error: ${errorMessage}. The model "${model}" may not be available.`);
      }
      
      throw new Error(`Groq API error (${errorType}): ${errorMessage}`);
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message
    };
  }
};

// Generic translation function that works with any provider
export const translateText = async (
  request: TranslationRequest,
  provider: ProviderType
): Promise<TranslationResponse> => {
  const { apiKey, model } = await getProviderConfig(provider);
  
  switch (provider) {
    case 'openai':
      return translateWithOpenAI(request, apiKey, model);
    case 'google':
      return translateWithGoogle(request, apiKey, model);
    case 'anthropic':
      return translateWithAnthropic(request, apiKey, model);
    case 'openrouter':
      return translateWithOpenRouter(request, apiKey, model);
    case 'groq':
      return translateWithGroq(request, apiKey, model);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

// Add a default export to satisfy Expo Router
export default function TranslatorApiUtils() {
  return null; // This component is never rendered
}