import React from 'react';
import LaunchScreenBase from './LaunchScreenBase';

export default function Box3Launch() {
  return (
    <LaunchScreenBase
      title="Box 3"
      description="Box 3 is a powerful analytics tool that provides insights and visualizations for your data. With its intuitive interface, you can quickly generate charts, reports, and perform complex analysis on various data sources."
      instructions={[
        "Import your data using the upload button or connect to an external data source.",
        "Select from various visualization types in the sidebar menu.",
        "Drag and drop fields to configure your visualizations.",
        "Use filters and parameters to refine your results.",
        "Save your work or export the visualizations for reporting.",
        "Share insights with team members using the share button."
      ]}
      toolRoute="/tools/Box3"
    />
  );
} 