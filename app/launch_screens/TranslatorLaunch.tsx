import React from 'react';
import LaunchScreenBase from './LaunchScreenBase';

export default function TranslatorLaunch() {
  return (
    <LaunchScreenBase
      title="Translator"
      description="The Translator tool helps you translate text between multiple languages using AI. It supports text translation with the ability to see the original text for easy comparison. The AI-powered translation delivers high-quality results across many language pairs."
      instructions={[
        "Select source and target languages from the dropdown menus.",
        "Type or paste the text you want to translate in the input field.",
        "Press the send button to get your translation.",
        "You can view the original text by tapping on the translated message.",
        "Clear the conversation history using the clear button in the top-right corner.",
        "You can change the AI provider by tapping on the provider selector at the top of the screen."
      ]}
      toolRoute="/tools/Translator"
    />
  );
} 