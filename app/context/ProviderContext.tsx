import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the provider types
export type ProviderType = 'openai' | 'google' | 'anthropic' | 'openrouter' | 'groq';

interface ProviderContextType {
  activeProviders: Record<ProviderType, boolean>;
  toggleProvider: (provider: ProviderType, isActive: boolean) => Promise<void>;
  isProviderActive: (provider: ProviderType) => boolean;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

const PROVIDER_STORAGE_KEY = '@active_providers';

export function ProviderProvider({ children }: { children: React.ReactNode }) {
  const [activeProviders, setActiveProviders] = useState<Record<ProviderType, boolean>>({
    openai: false,
    google: false,
    anthropic: false,
    openrouter: false,
    groq: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load saved provider states
  useEffect(() => {
    const loadProviderStates = async () => {
      try {
        const savedProviders = await AsyncStorage.getItem(PROVIDER_STORAGE_KEY);
        if (savedProviders) {
          setActiveProviders(JSON.parse(savedProviders));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading provider states:', error);
        setIsLoading(false);
      }
    };
    loadProviderStates();
  }, []);

  // Function to toggle provider state
  const toggleProvider = async (provider: ProviderType, isActive: boolean) => {
    try {
      const updatedProviders = {
        ...activeProviders,
        [provider]: isActive
      };
      
      await AsyncStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(updatedProviders));
      setActiveProviders(updatedProviders);
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving provider state:', error);
      return Promise.reject(error);
    }
  };

  // Function to check if a provider is active
  const isProviderActive = (provider: ProviderType): boolean => {
    return activeProviders[provider] || false;
  };

  if (isLoading) {
    return null;
  }

  return (
    <ProviderContext.Provider value={{ 
      activeProviders,
      toggleProvider,
      isProviderActive
    }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProviders() {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error('useProviders must be used within a ProviderProvider');
  }
  return context;
}

export default ProviderProvider; 