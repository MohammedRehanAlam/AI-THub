// API Testing Utilities

// OpenAI API Key Testing
export const testOpenAIKey = async (apiKey: string, modelName = "gpt-3.5-turbo") => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: "user", content: "Hello, this is a test message." }],
                max_tokens: 10
            })
        });

        const data = await response.json();

        if (response.status === 200) {
            return {
                success: true,
                message: "OpenAI API key is valid",
                model: modelName,
                data: data
            };
        } else {
            // Extract more detailed error information
            const errorMessage = data.error?.message || "Invalid OpenAI API key";
            const errorType = data.error?.type || "unknown_error";
            const errorCode = data.error?.code || null;
            
            // Format a more user-friendly error message
            let formattedError = errorMessage;
            
            // Handle common error cases
            if (errorType === "invalid_request_error" && errorMessage.includes("model")) {
                formattedError = `Model '${modelName}' not found or not available. Please check the model name.`;
            } else if (errorType === "authentication_error") {
                formattedError = "Invalid API key or insufficient permissions.";
            }
            
            return {
                success: false,
                message: formattedError,
                error: data.error,
                errorType,
                errorCode
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Network error. Please check your internet connection.",
            error: error.message
        };
    }
};

// Google AI (Gemini) API Key Testing
export const testGoogleAIKey = async (apiKey: string, modelName = "gemini-1.5-flash") => {
    try {
        // Add timeout to prevent long-hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: "Hello, this is a test message." }
                        ]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 10
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        const data = await response.json();

        if (response.status === 200) {
            return {
                success: true,
                message: "Google AI API key is valid",
                model: modelName,
                data: data
            };
        } else {
            // Extract more detailed error information
            const errorMessage = data.error?.message || "Invalid Google AI API key";
            const errorStatus = data.error?.status || "unknown_error";
            const errorCode = data.error?.code || null;
            
            // Format a more user-friendly error message
            let formattedError = errorMessage;
            
            // Handle common error cases
            if (errorStatus === "NOT_FOUND") {
                formattedError = `Model '${modelName}' not found. Please check the model name.`;
            } else if (errorStatus === "PERMISSION_DENIED" || errorCode === 403) {
                formattedError = "Invalid API key or insufficient permissions.";
            } else if (errorStatus === "INVALID_ARGUMENT") {
                formattedError = "Invalid request format. Please check your model name.";
            }
            
            return {
                success: false,
                message: formattedError,
                error: data.error,
                errorStatus,
                errorCode
            };
        }
    } catch (error: any) {
        // Provide more specific error message for timeout
        if (error.name === 'AbortError') {
            return {
                success: false,
                message: "Request timed out. The API may be experiencing issues.",
                error: error.message
            };
        }
        
        return {
            success: false,
            message: "Network error. Please check your internet connection.",
            error: error.message
        };
    }
};

// Anthropic API Key Testing
export const testAnthropicKey = async (apiKey: string, modelName = "claude-3-opus-20240229") => {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: modelName,
                max_tokens: 10,
                messages: [{ role: "user", content: "Hello, this is a test message." }]
            })
        });

        const data = await response.json();

        if (response.status === 200) {
            return {
                success: true,
                message: "Anthropic API key is valid",
                model: modelName,
                data: data
            };
        } else {
            // Extract more detailed error information
            const errorMessage = data.error?.message || "Invalid Anthropic API key";
            const errorType = data.error?.type || "unknown_error";
            
            // Format a more user-friendly error message
            let formattedError = errorMessage;
            
            // Handle common error cases
            if (errorType === "authentication_error") {
                formattedError = "Invalid API key or insufficient permissions.";
            } else if (errorType === "invalid_request_error" && errorMessage.includes("model")) {
                formattedError = `Model '${modelName}' not found or not available. Please check the model name.`;
            }
            
            return {
                success: false,
                message: formattedError,
                error: data.error,
                errorType
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Network error. Please check your internet connection.",
            error: error.message
        };
    }
};

// OpenRouter API Key Testing
export const testOpenRouterKey = async (apiKey: string, modelName = "openai/gpt-3.5-turbo") => {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://ai-thub.app' // Updated to match your app
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: "user", content: "Hello, this is a test message." }],
                max_tokens: 10
            })
        });

        const data = await response.json();

        if (response.status === 200) {
            return {
                success: true,
                message: "OpenRouter API key is valid",
                model: modelName,
                data: data
            };
        } else {
            // Extract more detailed error information
            const errorMessage = data.error?.message || "Invalid OpenRouter API key";
            const errorType = data.error?.type || "unknown_error";
            
            // Format a more user-friendly error message
            let formattedError = errorMessage;
            
            // Handle common error cases
            if (errorType === "authentication_error") {
                formattedError = "Invalid API key or insufficient permissions.";
            } else if (errorMessage.includes("model")) {
                formattedError = `Model '${modelName}' not found or not available. Please check the model name.`;
            }
            
            return {
                success: false,
                message: formattedError,
                error: data.error,
                errorType
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Network error. Please check your internet connection.",
            error: error.message
        };
    }
};

// Groq API Key Testing
export const testGroqKey = async (apiKey: string, modelName = "llama3-8b-8192") => {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: "user", content: "Hello, this is a test message." }],
                max_tokens: 10
            })
        });

        const data = await response.json();

        if (response.status === 200) {
            return {
                success: true,
                message: "Groq API key is valid",
                model: modelName,
                data: data
            };
        } else {
            // Extract more detailed error information
            const errorMessage = data.error?.message || "Invalid Groq API key";
            const errorType = data.error?.type || "unknown_error";
            
            // Format a more user-friendly error message
            let formattedError = errorMessage;
            
            // Handle common error cases
            if (errorType === "authentication_error") {
                formattedError = "Invalid API key or insufficient permissions.";
            } else if (errorMessage.includes("model")) {
                formattedError = `Model '${modelName}' not found or not available. Please check the model name.`;
            }
            
            return {
                success: false,
                message: formattedError,
                error: data.error,
                errorType
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Network error. Please check your internet connection.",
            error: error.message
        };
    }
};

// Add a default export to satisfy Expo Router's requirements
export default function ApiTests() {
  return null;
} 