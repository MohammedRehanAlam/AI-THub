import { ProviderType } from '../context/ProviderContext';

interface ProviderErrorInfo {
  name: string;
  docsUrl: string;
  quotaUrl: string;
  errorDocsUrl: string;
}

const PROVIDER_INFO: Record<ProviderType, ProviderErrorInfo> = {
  openai: {
    name: 'OpenAI',
    docsUrl: 'https://platform.openai.com/docs',
    quotaUrl: 'https://platform.openai.com/account/billing/overview',
    errorDocsUrl: 'https://platform.openai.com/docs/guides/error-codes/api-errors'
  },
  google: {
    name: 'Google AI',
    docsUrl: 'https://ai.google.dev/docs',
    quotaUrl: 'https://ai.google.dev/pricing',
    errorDocsUrl: 'https://ai.google.dev/gemini-api/docs/troubleshooting'
  },
  anthropic: {
    name: 'Anthropic',
    docsUrl: 'https://docs.anthropic.com',
    quotaUrl: 'https://docs.anthropic.com/en/api/rate-limits',
    errorDocsUrl: 'https://docs.anthropic.com/claude/reference/errors'
  },
  groq: {
    name: 'Groq',
    docsUrl: 'https://console.groq.com/docs/overview',
    quotaUrl: 'https://groq.com/pricing/',
    errorDocsUrl: 'https://console.groq.com/docs/errors'
  },
  openrouter: {
    name: 'OpenRouter',
    docsUrl: 'https://openrouter.ai/docs',
    quotaUrl: 'https://openrouter.ai/account',
    errorDocsUrl: 'https://openrouter.ai/docs#errors'
  }
};

// Helper function to get the appropriate documentation URL based on error type
const getLearnMoreUrl = (error: any, providerInfo: ProviderErrorInfo | null) => {
  if (!providerInfo) return '';

  if (error.message.includes('quota') || 
      error.message.includes('rate limit') || 
      error.message.includes('capacity') ||
      error.message.includes('exceeded')) {
    return providerInfo.quotaUrl;
  }
  else if (error.message.includes('API key') || 
           error.message.includes('invalid_api_key') ||
           error.message.includes('authentication')) {
    return providerInfo.docsUrl;
  }
  else if (error.message.includes('rate limit') || 
           error.message.includes('too many requests')) {
    return providerInfo.quotaUrl;
  }
  
  // Default to error documentation
  return providerInfo.errorDocsUrl;
};

/**
 * Formats an API error for display in a collapsible error alert
 * 
 * @param error The error object
 * @param provider The provider that was being used
 * @param additionalInfo Additional information to include in the error details
 * @returns An object with formatted error information
 */
export const formatApiError = (
  error: any, 
  provider: ProviderType | null,
  additionalInfo?: Record<string, string>
): {
  title: string;
  message: string;
  detailedError: string;
  learnMoreUrl?: string;
} => {
  // Default error information
  let title = 'API Error';
  let message = 'An error occurred while communicating with the API.';
  let detailedError = '';
  let learnMoreUrl: string | undefined;
  
  // Get provider info if available
  const providerInfo = provider ? PROVIDER_INFO[provider] : null;
  
  // Helper function to get provider and model info
  const getProviderModelInfo = () => {
    let info = '';
    if (error.providerInfo) {
      info += `Provider: ${error.providerInfo.provider}\n`;
      info += `Model: ${error.providerInfo.model}`;
    } else if (provider && providerInfo) {
      info += `Provider: ${providerInfo.name}\n`;
      if (error.response?.model) {
        info += `Model: ${error.response.model}`;
      }
    }
    return info ? info : 'No provider information available';
  };

  // Build the base error information with provider info
  const providerModelInfo = getProviderModelInfo();
  detailedError = `Error: ${error.message || 'Unknown error'}\n\n${providerModelInfo}\n`;
  
  // Add additional info
  if (additionalInfo) {
    Object.entries(additionalInfo).forEach(([key, value]) => {
      detailedError += `${key}: ${value}\n`;
    });
  }
  
  // Add API response details if available
  if (error.response) {
    try {
      detailedError += `\nAPI Response:\n${JSON.stringify(error.response, null, 2)}`;
    } catch (e) {
      detailedError += `\nAPI Response: [Could not stringify response]`;
    }
  }
  
  // Customize message based on error type
  if (error.message) {
    // Handle quota exceeded errors
    if (error.message.includes('quota') || 
        error.message.includes('rate limit') || 
        error.message.includes('capacity') ||
        error.message.includes('exceeded')) {
      title = 'Quota Error';
      message = `You exceeded your current quota. Check your plan and billing details.`;
      
      if (providerInfo) {
        learnMoreUrl = providerInfo.quotaUrl;
        detailedError += `\nFor more information:\n`;
        detailedError += `• Billing & Quota: ${providerInfo.quotaUrl}\n`;
        detailedError += `• Error Documentation: ${providerInfo.errorDocsUrl}\n`;
        detailedError += `• API Documentation: ${providerInfo.docsUrl}`;
      }
    }
    // Handle API key errors
    else if (error.message.includes('API key not configured') || 
             error.message.includes('No API key found') ||
             error.message.includes('invalid_api_key') ||
             error.message.includes('Invalid API key')) {
      title = 'API Key Error';
      message = `API key not properly configured or invalid. Please check your API settings.`;
      
      if (providerInfo) {
        learnMoreUrl = providerInfo.docsUrl;
        detailedError += `\nFor more information:\n`;
        detailedError += `• API Documentation: ${providerInfo.docsUrl}\n`;
        detailedError += `• Error Documentation: ${providerInfo.errorDocsUrl}`;
      }
    } 
    // Handle network errors
    else if (error.message.includes('Network') || 
             error.message.includes('fetch') || 
             error.message.includes('internet')) {
      title = 'Network Error';
      message = `Network error. Please check your internet connection and try again.`;
      
      if (providerInfo) {
        learnMoreUrl = providerInfo.docsUrl;
        detailedError += `\nAPI Status & Documentation:\n`;
        detailedError += `• ${providerInfo.docsUrl}`;
      }
    } 
    // Handle rate limiting errors
    else if (error.message.includes('rate limit') || 
             error.message.includes('too many requests')) {
      title = 'Rate Limit Error';
      message = `Too many requests. Please wait a moment and try again.`;
      
      if (providerInfo) {
        learnMoreUrl = providerInfo.quotaUrl;
        detailedError += `\nFor more information:\n`;
        detailedError += `• Rate Limits: ${providerInfo.quotaUrl}\n`;
        detailedError += `• Error Documentation: ${providerInfo.errorDocsUrl}`;
      }
    } 
    // Handle provider errors
    else if (error.message.includes('provider') && error.message.includes('not active')) {
      title = 'Provider Error';
      message = `The selected provider is not active. Please enable it in the API settings.`;
      
      if (providerInfo) {
        learnMoreUrl = providerInfo.docsUrl;
        detailedError += `\nProvider Documentation:\n`;
        detailedError += `• ${providerInfo.docsUrl}`;
      }
    } 
    else if (error.message.includes('No AI provider selected')) {
      title = 'Provider Error';
      message = 'No AI provider selected. Please select a provider in the API settings.';
    } 
    // Use the error message as is for other cases
    else {
      message = error.message;
      
      if (providerInfo) {
        learnMoreUrl = providerInfo.errorDocsUrl;
        detailedError += `\nFor more information:\n`;
        detailedError += `• Error Documentation: ${providerInfo.errorDocsUrl}\n`;
        detailedError += `• API Documentation: ${providerInfo.docsUrl}`;
      }
    }

    // Add provider info after the main message if available
    if (providerModelInfo && providerModelInfo !== 'No provider information available') {
      message += `\n\n${providerModelInfo}`;
    }
  }
  
  return {
    title,
    message,
    detailedError,
    learnMoreUrl
  };
};

// Add a default export to satisfy Expo Router
export default function ApiErrorUtils() {
  return null; // This component is never rendered
} 