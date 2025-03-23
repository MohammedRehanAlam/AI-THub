import React from 'react';
import LaunchScreenBase from './LaunchScreenBase';

export default function Box2Launch() {
  return (
    <LaunchScreenBase
      title="Box 2"
      description="Box 2 is a specialized tool that helps you organize and manipulate data efficiently. This tool provides a user-friendly interface for common data processing tasks with real-time updates and results."
      instructions={[
        "Input your data into the provided fields to get started.",
        "Use the dropdown menu to select the processing options you need.",
        "Click on specific items to view more details or edit them.",
        "Use the action buttons at the bottom to execute operations on your data.",
        "Check the results panel for feedback and processing output.",
        "You can save and export your results using the export button."
      ]}
      toolRoute="/tools/Box2"
    />
  );
} 