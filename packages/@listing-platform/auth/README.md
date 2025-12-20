# @listing-platform/auth

Authentication SDK with pre-built login, signup, and OAuth components.

## Features

- **Login/Signup Forms** - Complete authentication UI
- **OAuth Providers** - Google, GitHub, Facebook, etc.
- **Password Reset** - Forgot password flow
- **Session Management** - Auth context and hooks

## Usage

```tsx
import { LoginForm, SignupForm, AuthProvider, useAuth } from '@listing-platform/auth';

<AuthProvider>
  <LoginForm onSuccess={() => router.push('/dashboard')} />
  <SignupForm onSuccess={() => router.push('/onboarding')} />
</AuthProvider>

// Access auth state
const { user, isAuthenticated, signOut } = useAuth();
```

## License

MIT
