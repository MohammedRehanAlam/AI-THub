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
            return {
                success: false,
                message: data.error?.message || "Invalid OpenAI API key",
                error: data.error
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Error testing OpenAI API key",
            error: error.message
        };
    }
};

// Google AI (Gemini) API Key Testing
export const testGoogleAIKey = async (apiKey: string, modelName = "gemini-1.5-flash") => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}/generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, this is a test message." }] }]
            })
        });

        const data = await response.json();

        if (response.status === 200) {
            return {
                success: true,
                message: "Google AI API key is valid",
                model: modelName,
                data: data
            };
        } else {
            return {
                success: false,
                message: data.error?.message || "Invalid Google AI API key",
                error: data.error
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Error testing Google AI API key",
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
            return {
                success: false,
                message: data.error?.message || "Invalid Anthropic API key",
                error: data.error
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Error testing Anthropic API key",
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
                'HTTP-Referer': 'https://your-app-domain.com' // Required by OpenRouter
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
            return {
                success: false,
                message: data.error?.message || "Invalid OpenRouter API key",
                error: data.error
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Error testing OpenRouter API key",
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
            return {
                success: false,
                message: data.error?.message || "Invalid Groq API key",
                error: data.error
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Error testing Groq API key",
            error: error.message
        };
    }
}; 