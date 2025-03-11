// Translator API Utilities for different providers
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProviderType } from '../context/ProviderContext';

// Interface for translation request
export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
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
    openrouter: "openai/gpt-3.5-turbo",
    groq: "llama3-8b-8192"
  };
  
  return DEFAULT_MODELS[provider];
};

// Translate text using OpenAI
export const translateWithOpenAI = async (
  request: TranslationRequest,
  apiKey: string,
  model: string
): Promise<TranslationResponse> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: `Translate the following text from ${request.fromLanguage} to ${request.toLanguage}. Only provide the translation, no additional text: ${request.text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.choices && data.choices[0]) {
      return {
        translatedText: data.choices[0].message.content.trim(),
        success: true
      };
    } else {
      throw new Error(data.error?.message || 'Unknown error');
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate the following text from ${request.fromLanguage} to ${request.toLanguage}. Only provide the translation, no additional text: ${request.text}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const data = await response.json();

    if (response.status === 200 && data.candidates && data.candidates[0]) {
      return {
        translatedText: data.candidates[0].content.parts[0].text.trim(),
        success: true
      };
    } else {
      throw new Error(data.error?.message || 'Unknown error');
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: `Translate the following text from ${request.fromLanguage} to ${request.toLanguage}. Only provide the translation, no additional text: ${request.text}`
          }
        ]
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.content && data.content.length > 0) {
      return {
        translatedText: data.content[0].text.trim(),
        success: true
      };
    } else {
      throw new Error(data.error?.message || 'Unknown error');
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null
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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ai-thub.app'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: `Translate the following text from ${request.fromLanguage} to ${request.toLanguage}. Only provide the translation, no additional text: ${request.text}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.choices && data.choices[0]) {
      return {
        translatedText: data.choices[0].message.content.trim(),
        success: true
      };
    } else {
      throw new Error(data.error?.message || 'Unknown error');
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null
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
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: `Translate the following text from ${request.fromLanguage} to ${request.toLanguage}. Only provide the translation, no additional text: ${request.text}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.choices && data.choices[0]) {
      return {
        translatedText: data.choices[0].message.content.trim(),
        success: true
      };
    } else {
      throw new Error(data.error?.message || 'Unknown error');
    }
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null
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
        error: `No API key found for ${provider}. Please add your API key in the settings.`
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
          error: `Unsupported provider: ${provider}`
        };
    }
    
    // Add provider and model info to the response
    return {
      ...result,
      providerInfo: {
        provider,
        model
      }
    };
  } catch (error: any) {
    return {
      translatedText: '',
      success: false,
      error: error.message,
      response: error.response || null
    };
  }
};

// Add a default export to satisfy Expo Router
export default function TranslatorApiUtils() {
  return null; // This component is never rendered
} 