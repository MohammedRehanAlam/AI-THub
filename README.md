# AI THub

A powerful translation application that leverages advanced AI technology to provide accurate and context-aware translations across multiple languages.

## Features

- Real-time translation with minimal latency
- Support for 100+ languages with high accuracy
- Context-aware translations that understand nuance and idioms
- User-friendly interface with intuitive controls
- Dark/Light mode support with automatic system theme detection
- Cross-platform compatibility (iOS, Android, Web)
- Over-the-air updates via EAS Update
- Multiple AI provider integration with custom SVG logos
- Offline mode for basic translations
- History tracking and favorites system

## Tech Stack

- React Native / Expo
- TypeScript
- Node.js
- React Navigation for routing
- React Native SVG for vector graphics
- Expo Router for file-based routing
- Reanimated for smooth animations
- EAS Update for OTA updates
- AsyncStorage for local data persistence
- ESLint for code quality
- Jest for testing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8+) or yarn (v1.22+)
- Expo CLI (`npm install -g expo-cli`)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-thub.git
   cd ai-thub
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan the QR code with Expo Go app on your physical device

## Project Structure

```
ai-thub/
├── app/                 # Main application screens and navigation
│   ├── components/      # UI components specific to screens
│   ├── context/         # React context providers
│   ├── tools/           # Utility tools for the app
│   └── _utils/          # Helper functions
├── assets/              # Static assets (images, fonts, SVG logos)
├── components/          # Reusable UI components
├── constants/           # Application constants and theme settings
├── hooks/               # Custom React hooks
├── scripts/             # Utility scripts
├── utils/               # General utility functions
├── .vscode/             # VS Code configuration
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
├── babel.config.js      # Babel configuration
├── metro.config.js      # Metro bundler configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies and scripts
```

## Development

### Running on Different Platforms

- iOS: `npx expo start --ios`
- Android: `npx expo start --android`
- Web: `npx expo start --web`

### Available Scripts

- `npm start` or `yarn start`: Start the Expo development server
- `npm run android` or `yarn android`: Run on Android device/emulator
- `npm run ios` or `yarn ios`: Run on iOS simulator
- `npm run web` or `yarn web`: Run on web browser
- `npm run lint` or `yarn lint`: Run ESLint
- `npm run test` or `yarn test`: Run tests
- `npm run build:android`: Build Android APK/AAB
- `npm run build:ios`: Build iOS IPA
- `npm run publish-update`: Publish an update via EAS Update

## Features in Detail

### Translation Capabilities
- Real-time translation between multiple languages
- Context-aware translations for improved accuracy
- Support for text, document, and conversation translations
- Voice input and text-to-speech output
- Image-to-text translation (OCR)

### User Interface
- Clean and intuitive design
- Dark and light theme support with auto-switching
- Responsive layout for all screen sizes
- Sidebar navigation for easy access to features
- Custom SVG logos for different AI providers
- Haptic feedback for better user experience
- Accessibility features (VoiceOver, TalkBack support)

### AI Provider Integration
The app integrates with multiple AI providers:
- OpenAI (GPT-3.5, GPT-4)
- Google AI (Gemini models)
- Anthropic (Claude models)
- OpenRouter (multi-provider access)
- Groq (fast inference for open-source models)
- Mistral AI
- Cohere

Each provider has a custom SVG logo that adapts to the app's theme.

### Additional Features
- Translation history with search and filtering
- Favorite translations for quick access
- Language auto-detection
- Offline mode support for basic translations
- Customizable translation settings
- Export translations to various formats
- Share translations via social media or messaging apps

## SVG Implementation

This project uses `react-native-svg` and `react-native-svg-transformer` to handle SVG files:

- SVG files are stored in `/assets/API_Providers_Logos/`
- React components for each logo are in `/app/components/LogoIcons.tsx`
- The components adapt to the app's theme (dark/light mode)

To add a new SVG logo:
1. Add the SVG file to `/assets/API_Providers_Logos/`
2. Create a new component in `/app/components/LogoIcons.tsx`
3. Import and use the component where needed

## EAS Update

This app uses EAS Update to deliver over-the-air updates to users without requiring a new app store submission.

### How It Works

EAS Update allows you to push JavaScript and asset changes directly to users without going through the app stores. This is useful for:

- Bug fixes
- Minor feature updates
- Content updates
- UI tweaks

### Publishing Updates

To publish an update to your app:

```bash
# Publish to production channel
npm run publish-update:production "Your update message"

# Publish to preview channel
npm run publish-update:preview "Your update message"

# Publish to development channel
npm run publish-update:development "Your update message"

# Or use the generic command with custom channel and message
npm run publish-update [channel] "Your update message"
```

### Update Channels

- **production**: For updates to the production app
- **preview**: For testing updates before pushing to production
- **development**: For development and testing

### Testing Updates

1. Build your app with EAS Build for the desired channel
2. Install the app on your device
3. Make changes to your app code
4. Publish an update using one of the commands above
5. Open the app on your device - it should automatically check for and apply the update

### Manual Update Check

The app includes a component that allows users to manually check for updates. You can add this to your settings or about screen:

```jsx
import UpdateButton from '../components/UpdateButton';

// In your component:
<UpdateButton label="Check for Updates" />
```

## Deployment

### EAS Build

This project uses EAS Build for creating production-ready builds:

```bash
# Build for internal testing
eas build --profile preview --platform all

# Build for production
eas build --profile production --platform all
```

### App Store / Play Store Submission

Follow the Expo documentation for submitting your application to app stores:
[Expo Submission Guide](https://docs.expo.dev/submit/introduction/)

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

## Development Guidelines

### Code Style

This project uses ESLint for code quality and consistency. The configuration can be found in `.eslintrc.js`.

### TypeScript

The project is written in TypeScript. Type definitions are managed in:
- `tsconfig.json` for project-wide TypeScript configuration
- `expo-env.d.ts` for Expo-specific type definitions
- `declarations.d.ts` for custom type declarations

### VS Code Setup

The project includes VS Code configuration in the `.vscode` directory for:
- Recommended extensions
- Editor settings
- Debug configurations
- Task definitions

## Troubleshooting

### Common Issues

- **Metro bundler issues**: Try clearing the cache with `npx expo start -c`
- **Dependency conflicts**: Run `npm dedupe` or `yarn dedupe`
- **Build failures**: Check the EAS build logs and ensure all configuration is correct
- **SVG rendering issues**: Ensure SVGs are properly optimized and follow the format requirements
- **TypeScript errors**: Run `npm run type-check` to verify type definitions

### Getting Help

If you encounter issues not covered here, please:
1. Check the [Expo documentation](https://docs.expo.dev/)
2. Search for similar issues in the GitHub repository
3. Open a new issue with detailed information about your problem

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Follows the project's coding standards
- Includes appropriate tests
- Updates documentation as needed
- Passes all linting and type checks

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For support or feedback, please contact us at: support@aithub.com

## Acknowledgements

- [Expo](https://expo.dev/) for the amazing React Native toolchain
- [OpenAI](https://openai.com/) for their powerful language models
- [React Native Community](https://reactnative.dev/community/overview) for their invaluable packages
- All contributors who have helped improve this project 