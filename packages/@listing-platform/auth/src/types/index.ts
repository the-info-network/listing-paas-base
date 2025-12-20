/**
 * Types for Auth SDK
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  user: User;
}

export type OAuthProvider = 'google' | 'github' | 'facebook' | 'twitter' | 'apple' | 'linkedin';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: SignupData) => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
