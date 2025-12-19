'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, Session, LoginCredentials, SignupData, OAuthProvider, AuthContextValue } from '../types';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.session) { setSession(data.session); setUser(data.session.user); }
        }
      } finally { setIsLoading(false); }
    };
    checkSession();
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    setSession(data.session);
    setUser(data.session.user);
  }, []);

  const signUp = useCallback(async (data: SignupData) => {
    const response = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Signup failed');
    const result = await response.json();
    if (result.session) { setSession(result.session); setUser(result.session.user); }
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    window.location.href = `/api/auth/oauth/${provider}`;
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAuthenticated: !!session, signIn, signUp, signInWithOAuth, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
