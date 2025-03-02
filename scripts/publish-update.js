/**
 * Script to publish EAS Updates
 * 
 * Usage:
 * node scripts/publish-update.js [channel] [message]
 * 
 * Example:
 * node scripts/publish-update.js production "Fixed bug in login screen"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Default values
const DEFAULT_CHANNEL = 'production';
const DEFAULT_MESSAGE = 'Update ' + new Date().toISOString();

// Get arguments
const channel = process.argv[2] || DEFAULT_CHANNEL;
const message = process.argv[3] || DEFAULT_MESSAGE;

// Validate channel
const validChannels = ['production', 'preview', 'development'];
if (!validChannels.includes(channel)) {
  console.error(`Error: Invalid channel "${channel}". Valid channels are: ${validChannels.join(', ')}`);
  process.exit(1);
}

console.log(`Publishing update to channel: ${channel}`);
console.log(`Update message: ${message}`);
console.log('');

try {
  // Run the EAS update command
  const command = `npx eas update --channel=${channel} --message="${message}"`;
  console.log(`Running: ${command}`);
  console.log('');
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('');
  console.log('✅ Update published successfully!');
  console.log(`Channel: ${channel}`);
  console.log(`Message: ${message}`);
  
  // Provide instructions for testing
  console.log('');
  console.log('To test this update:');
  console.log(`1. Make sure your app is built with EAS Build for the "${channel}" channel`);
  console.log('2. Install the app on your device');
  console.log('3. Open the app and it should automatically check for updates');
  console.log('   or use the "Check for Updates" button if you added it to your app');
  
} catch (error) {
  console.error('❌ Failed to publish update:');
  console.error(error.message);
  process.exit(1);
} 