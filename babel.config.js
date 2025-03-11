module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './',
          },
        },
      ],
      'react-native-reanimated/plugin',
      ['transform-inline-environment-variables', {
        include: ['EXPO_PUBLIC_GEMINI_API_KEY']
      }]
    ],
  };
}; 