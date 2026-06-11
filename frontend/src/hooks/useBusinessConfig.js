import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { businessConfig } from '../config/businessConfig';

export function useBusinessConfig(overrideType = null) {
  const auth = useContext(AuthContext);
  const businessType = overrideType || auth?.businessType;
  
  // Default to restaurant if type is unknown or not set
  const config = businessConfig[businessType] || businessConfig.restaurant;
  
  return {
    ...config,
    type: businessType || 'restaurant'
  };
}

// Keep this for backward compatibility if needed, but we'll transition to useBusinessConfig
export function useBusinessLabels() {
  const config = useBusinessConfig();
  return config.labels;
}
