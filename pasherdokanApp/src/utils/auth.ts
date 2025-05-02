import { createContext, useContext } from 'react';

export interface AuthState {
  isAuthenticated: boolean | null;
  setIsAuthenticated: (value: boolean) => void;
  userRole: 'shopkeeper' | 'customer' | null;
  setUserRole: (role: 'shopkeeper' | 'customer' | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
