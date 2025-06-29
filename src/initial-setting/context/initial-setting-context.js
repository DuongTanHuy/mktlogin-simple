import { createContext, useContext } from 'react';

// ----------------------------------------------------------------------
export const InitialSettingContext = createContext({});

export const useInitialSettingContext = () => {
  const context = useContext(InitialSettingContext);
  if (!context) return null;
  return context;
};
