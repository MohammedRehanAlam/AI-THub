# AI THub

A powerful translation application that leverages advanced AI technology to provide accurate and context-aware translations across multiple languages.

## Features

- Real-time translation
- Support for multiple languages
- Context-aware translations
- User-friendly interface
- Dark/Light mode support
- Cross-platform compatibility (iOS, Android, Web)
- Over-the-air updates via EAS Update

## Tech Stack

- React Native
- Expo
- TypeScript
- Node.js

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

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

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values as needed

4. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

- `/app` - Main application screens and navigation
- `/assets` - Static assets like images and fonts
- `/components` - Reusable UI components
- `/constants` - Application constants and theme settings
- `/hooks` - Custom React hooks
- `/scripts` - Utility scripts

## Development

### Running on Different Platforms

- iOS: `npx expo start --ios`
- Android: `npx expo start --android`
- Web: `npx expo start --web`

## Features in Detail

### Translation Capabilities
- Real-time translation between multiple languages
- Context-aware translations for improved accuracy
- Support for text, document, and conversation translations

### User Interface
- Clean and intuitive design
- Dark and light theme support
- Responsive layout for all screen sizes
- Sidebar navigation for easy access to features

### Additional Features
- Translation history
- Favorite translations
- Language auto-detection
- Offline mode support

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

Follow the Expo documentation for building and deploying your application:
[Expo Deployment Guide](https://docs.expo.dev/distribution/introduction/)

## License

This project is licensed under the MIT License.

## Contact

For support or feedback, please contact us at: support@aithub.com 