export function initializeUpdates(): Promise<void>;
export function checkAndInstallUpdates(skipAlert?: boolean): Promise<void>;
export function checkForUpdates(): Promise<boolean>;
export function fetchAndInstallUpdate(): Promise<boolean>;
export function reloadApp(): void;

// Add default export to satisfy Expo Router's requirements
export default function UpdateUtils(): null; 
