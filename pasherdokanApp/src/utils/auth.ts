import React, { createContext, useContext } from 'react';

   interface AuthState {
     isAuthenticated: boolean | null;
     setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
     userRole: 'shopkeeper' | 'customer' | null;
     setUserRole: React.Dispatch<React.SetStateAction<'shopkeeper' | 'customer' | null>>;
   }

   export const AuthContext = createContext<AuthState | undefined>(undefined);

   export const useAuth = (): AuthState => {
     const context = useContext(AuthContext);
     if (!context) {
       throw new Error('useAuth must be used within an AuthProvider');
     }
     return context;
   };
