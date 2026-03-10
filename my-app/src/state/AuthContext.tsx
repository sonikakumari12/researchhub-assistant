import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type AuthContextValue = {
  token: string | null;
  userEmail: string | null;
  setToken: (t: string | null) => void;
  setUserEmail: (email: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('rh_token');
  });
  const [userEmail, setUserEmailState] = useState<string | null>(() => {
    return localStorage.getItem('rh_user_email');
  });

  const updateToken = (t: string | null) => {
    setToken(t);
    if (t) localStorage.setItem('rh_token', t);
    else localStorage.removeItem('rh_token');
  };

  const setUserEmail = (email: string | null) => {
    setUserEmailState(email);
    if (email) localStorage.setItem('rh_user_email', email);
    else localStorage.removeItem('rh_user_email');
  };

  const logout = () => {
    updateToken(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userEmail,
        setToken: updateToken,
        setUserEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
