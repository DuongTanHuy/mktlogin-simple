import { createContext, useContext } from 'react';

// ----------------------------------------------------------------------
export const BalanceContext = createContext({});

export const useBalanceContext = () => {
  const context = useContext(BalanceContext);
  if (!context) throw new Error('BalanceContext must be use inside BalanceProvider');
  return context;
};
