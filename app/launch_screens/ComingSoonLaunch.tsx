import React from 'react';
import LaunchScreenBase from './LaunchScreenBase';

export default function ComingSoonLaunch() {
  return (
    <LaunchScreenBase
      title="Coming Soon"
      description="This feature is currently under development and will be available in a future update. We're working hard to bring you exciting new tools and capabilities to enhance your experience."
      instructions={[
        "Check back regularly for updates on this upcoming feature.",
        "Subscribe to our newsletter to be notified when this tool is released.",
        "Explore our other available tools while you wait for this one.",
        "If you have specific requirements or ideas for this tool, feel free to contact our support team.",
        "Beta testing opportunities may be available for select users."
      ]}
      toolRoute="/tools/ComingSoon"
    />
  );
} 