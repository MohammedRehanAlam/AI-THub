import { ProviderType } from '../context/ProviderContext';

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
} => {
  // Default error information
  let title = 'API Error';
  let message = 'An error occurred while communicating with the API.';
  
  // Create detailed error information
  let detailedError = `Error: ${error.message || 'Unknown error'}\n\n`;
  
  // Add provider info
  if (error.providerInfo) {
    detailedError += `Provider: ${error.providerInfo.provider}\n`;
    detailedError += `Model: ${error.providerInfo.model}\n`;
  } else if (provider) {
    detailedError += `Provider: ${provider}\n`;
  }
  
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
      
      // For OpenAI quota errors
      if (error.message.includes('openai') || (provider === 'openai')) {
        message = 'You exceeded your current quota. Check your plan and billing details. For more information: https://platform.openai.com/docs/guides/error-codes/api-errors';
      } 
      // For Google quota errors
      else if (error.message.includes('google') || (provider === 'google')) {
        message = 'You exceeded your current quota. Check your plan and billing details. For more information: https://ai.google.dev/docs/error_codes';
      }
      // For Anthropic quota errors
      else if (error.message.includes('anthropic') || (provider === 'anthropic')) {
        message = 'You exceeded your current quota. Check your plan and billing details. For more information: https://docs.anthropic.com/claude/reference/errors';
      }
      // Generic quota error
      else {
        message = 'You exceeded your current quota. Please check your plan and billing details.';
      }
    }
    // Handle API key errors
    else if (error.message.includes('API key not configured') || 
             error.message.includes('No API key found') ||
             error.message.includes('invalid_api_key') ||
             error.message.includes('Invalid API key')) {
      title = 'API Key Error';
      message = 'API key not properly configured or invalid. Please check your API settings.';
    } 
    // Handle network errors
    else if (error.message.includes('Network') || 
             error.message.includes('fetch') || 
             error.message.includes('internet')) {
      title = 'Network Error';
      message = 'Network error. Please check your internet connection and try again.';
    } 
    // Handle rate limiting errors
    else if (error.message.includes('rate limit') || 
             error.message.includes('too many requests')) {
      title = 'Rate Limit Error';
      message = 'Too many requests. Please wait a moment and try again.';
    } 
    // Handle provider errors
    else if (error.message.includes('provider') && error.message.includes('not active')) {
      title = 'Provider Error';
      message = 'The selected provider is not active. Please enable it in the API settings.';
    } 
    else if (error.message.includes('No AI provider selected')) {
      title = 'Provider Error';
      message = 'No AI provider selected. Please select a provider in the API settings.';
    } 
    // Use the error message as is for other cases
    else {
      message = error.message;
    }
  }
  
  return {
    title,
    message,
    detailedError
  };
};

// Add a default export to satisfy Expo Router
export default function ApiErrorUtils() {
  return null; // This component is never rendered
} 