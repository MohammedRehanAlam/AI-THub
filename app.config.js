import 'dotenv/config'; // Import dotenv at the top of your app.config.js

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra, // Preserve existing extra values
      GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    },
  };
}; 