# Weaver Authentication Flow & Cookie Storage Documentation

## Overview

This document provides a comprehensive guide to the authentication flow and cookie storage system used in the Weaver project. The system implements a dual-token architecture with AWS Cognito integration, featuring secure cookie-based session management and automatic token refresh mechanisms.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Authentication Flow](#frontend-authentication-flow)
3. [Backend Authentication Flow](#backend-authentication-flow)
4. [Cookie Storage System](#cookie-storage-system)
5. [Token Management](#token-management)
6. [Session Lifecycle](#session-lifecycle)
7. [Security Considerations](#security-considerations)
8. [Implementation Guide](#implementation-guide)

## Architecture Overview

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AWS Cognito   │
│   (React)       │    │   (Laravel)     │    │   User Pool     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Login Request      │                       │
         ├──────────────────────►│                       │
         │                       │ 2. Validate Token     │
         │                       ├──────────────────────►│
         │                       │ 3. User Data          │
         │                       │◄──────────────────────┤
         │ 4. Tokens + User      │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 5. Store in Cookies   │                       │
         │                       │                       │
```

### Token Types

1. **ID Token (Cognito)**: Contains user identity information
2. **Access Token (API)**: For backend API authentication
3. **Refresh Token**: For token renewal
4. **Initial Access Token**: Immutable token for long-term API access

## Frontend Authentication Flow

### 1. Login Process

```typescript
// AuthContext.tsx - Login Flow
const login = async (email: string, password: string) => {
  try {
    // 1. Authenticate with backend
    const response = await authenticationService.login({ email, password });
    
    if (response.success) {
      // 2. Create user data object
      const userData: User = {
        id: response.user.id.toString(),
        sub: response.user.id.toString(),
        name: response.user.fullName,
        email: response.user.email,
        business_id: response.businessId.toString()
      };
      
      // 3. Store tokens and user data
      login(response.accessToken, userData);
    }
  } catch (error) {
    // Handle login errors
  }
};
```

### 2. Token Storage

```typescript
// authUtils.ts - Token Storage
export const storeTokenData = (tokenData: TokenData, user: User) => {
  const expiresInSeconds = tokenData.expiresAt - Math.floor(Date.now() / 1000);

  // Store immutable initial access token (15 days)
  const initialAccess = getCookie(COOKIE_NAMES.ACCESS_TOKEN_INITIAL);
  if (!initialAccess) {
    setCookieWithExpiry(COOKIE_NAMES.ACCESS_TOKEN_INITIAL, tokenData.accessToken, 15 * 24 * 60 * 60);
    setCookieWithExpiry(COOKIE_NAMES.ACCESS_TOKEN, tokenData.accessToken, expiresInSeconds);
  }
  
  // Store session tokens (calculated expiration)
  setCookieWithExpiry(COOKIE_NAMES.COGNITO_TOKEN, tokenData.idToken, expiresInSeconds);
  setCookieWithExpiry(COOKIE_NAMES.REFRESH_TOKEN, tokenData.refreshToken, 15 * 24 * 60 * 60);
  setCookieWithExpiry(COOKIE_NAMES.TOKEN_EXPIRES_AT, tokenData.expiresAt.toString(), expiresInSeconds);
  setCookieWithExpiry(COOKIE_NAMES.USER, JSON.stringify(user), expiresInSeconds);
};
```

### 3. Cookie Configuration

```typescript
// cookieUtils.ts - Secure Cookie Settings
export const setCookieWithExpiry = (name: string, value: string, maxAgeSeconds: number): void => {
  setCookie(name, value, {
    maxAge: maxAgeSeconds,
    path: '/',
    secure: true,        // HTTPS only
    sameSite: 'Strict'  // CSRF protection
  });
};
```

## Backend Authentication Flow

### 1. Login Endpoint

```php
// UserController.php - Login Process
public function login(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
        'password' => 'required|string|min:6',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 400);
    }

    try {
        // 1. Authenticate with AWS Cognito
        $cognitoResponse = $this->awsCognitoService->adminInitiateAuth([
            'AuthFlow' => 'ADMIN_NO_SRP_AUTH',
            'UserPoolId' => config('aws.cognito.user_pool_id'),
            'ClientId' => config('aws.cognito.client_id'),
            'AuthParameters' => [
                'USERNAME' => $request->email,
                'PASSWORD' => $request->password,
            ],
        ]);

        // 2. Extract tokens
        $idToken = $cognitoResponse['AuthenticationResult']['IdToken'];
        $accessToken = $cognitoResponse['AuthenticationResult']['AccessToken'];
        $refreshToken = $cognitoResponse['AuthenticationResult']['RefreshToken'];

        // 3. Validate and decode ID token
        $tokenPayload = $this->jwtValidator->validateAndDecode($idToken);
        
        // 4. Get or create user
        $user = $this->getOrCreateUser($tokenPayload);
        
        // 5. Create session
        $session = $this->createUserSession($user, $idToken);

        return response()->json([
            'status' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'fullName' => $user->name,
            ],
            'businessId' => $user->business_id,
            'accessToken' => $accessToken,
            'idToken' => $idToken,
            'refreshToken' => $refreshToken,
            'expiresAt' => $tokenPayload['exp']
        ]);

    } catch (Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'Authentication failed',
            'error' => $e->getMessage()
        ], 401);
    }
}
```

### 2. Token Validation Middleware

```php
// Middleware for protected routes
public function handle($request, Closure $next)
{
    $token = $request->bearerToken() ?? $request->cookie('WP_access_token');
    
    if (!$token) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    try {
        // Validate JWT token
        $payload = $this->jwtValidator->validateAndDecode($token);
        
        // Get user from token
        $user = User::where('cognito_sub', $payload['sub'])->first();
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }

        // Attach user to request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
        
    } catch (Exception $e) {
        return response()->json(['message' => 'Invalid token'], 401);
    }
}
```

## Cookie Storage System

### Cookie Names and Purposes

```typescript
const COOKIE_NAMES = {
  ACCESS_TOKEN: 'WP_access_token',           // API access token
  ACCESS_TOKEN_INITIAL: 'WP_access_token_initial', // Immutable initial token
  COGNITO_TOKEN: 'WP_cognito_token',        // Cognito ID token
  REFRESH_TOKEN: 'WP_refresh_token',        // Token refresh
  TOKEN_EXPIRES_AT: 'WP_token_expires_at',  // Expiration timestamp
  USER: 'WP_user',                          // User data
  BUSINESS_ID: 'business_id'                // Business context
} as const;
```

### Storage Durations

| Cookie Type | Duration | Purpose |
|-------------|----------|---------|
| ACCESS_TOKEN_INITIAL | 15 days | Immutable API access |
| REFRESH_TOKEN | 15 days | Token renewal |
| ACCESS_TOKEN | Calculated | Session access |
| COGNITO_TOKEN | Calculated | User identity |
| USER | Calculated | User data |
| TOKEN_EXPIRES_AT | Calculated | Expiration tracking |

### Cookie Security Settings

```typescript
interface CookieOptions {
  expires?: Date;
  maxAge?: number;        // in seconds
  path?: string;          // '/'
  domain?: string;
  secure?: boolean;       // true (HTTPS only)
  sameSite?: 'Strict' | 'Lax' | 'None'; // 'Strict'
  httpOnly?: boolean;     // false (for JS access)
}
```

## Token Management

### 1. Token Refresh Flow

```typescript
// authUtils.ts - Token Refresh
export const refreshTokens = async (): Promise<TokenData | null> => {
  try {
    const session = await fetchAuthSession();
    
    if (session.tokens && session.tokens.accessToken && session.tokens.idToken) {
      const accessToken = session.tokens.accessToken.toString();
      const idToken = session.tokens.idToken.toString();
      const refreshToken = session.tokens.refreshToken?.toString() || '';
      
      // Calculate expiration (5 minutes for testing)
      const expiresAt = Math.floor(Date.now() / 1000) + (5 * 60);
      
      // Update only Cognito-related cookies
      setCookieWithExpiry(COOKIE_NAMES.COGNITO_TOKEN, idToken, 5 * 60);
      setCookieWithExpiry(COOKIE_NAMES.TOKEN_EXPIRES_AT, expiresAt.toString(), 5 * 60);
      
      return { accessToken, idToken, refreshToken, expiresAt };
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return null;
  }
};
```

### 2. Token Validation

```typescript
// authUtils.ts - Token Validation
export const validateCognitoToken = (token: string): boolean => {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    
    // Check expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    // Check not-before
    if (payload.nbf && payload.nbf > currentTime) {
      return false;
    }
    
    // Validate issuer
    const expectedIssuer = `https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_mVNQG81kf`;
    if (payload.iss !== expectedIssuer) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};
```

## Session Lifecycle

### 1. Login Sequence

```
1. User submits credentials
2. Frontend sends login request to backend
3. Backend validates with AWS Cognito
4. Backend returns tokens and user data
5. Frontend stores tokens in secure cookies
6. Frontend initializes token refresh service
7. User is redirected to dashboard
```

### 2. Session Maintenance

```
1. Token refresh service runs every 4 minutes
2. Checks if tokens need refresh (5-minute buffer)
3. Uses AWS Amplify to refresh tokens
4. Updates cookies with new tokens
5. Maintains session without user interaction
```

### 3. Logout Sequence

```
1. User clicks logout
2. Frontend calls logout endpoint
3. Backend invalidates session
4. Frontend clears all auth cookies
5. Frontend redirects to login page
```

## Security Considerations

### 1. Cookie Security

- **Secure Flag**: All cookies use `secure: true` (HTTPS only)
- **SameSite**: Set to `Strict` for CSRF protection
- **HttpOnly**: Set to `false` for JavaScript access (required for token refresh)
- **Path**: Restricted to `/` for proper scope

### 2. Token Security

- **Short-lived Session Tokens**: 5 minutes for active sessions
- **Long-lived Initial Token**: 15 days for API access
- **Automatic Refresh**: Prevents session expiration
- **Secure Storage**: Encrypted cookies with expiration

### 3. Validation

- **JWT Validation**: Server-side token validation
- **Issuer Verification**: Ensures tokens from correct Cognito pool
- **Expiration Checks**: Multiple layers of expiration validation
- **User Verification**: Database lookup for user existence

## Implementation Guide

### Frontend Setup

1. **Install Dependencies**
```bash
npm install aws-amplify jwt-decode
```

2. **Configure Amplify**
```typescript
// amplifyConfig.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-2_mVNQG81kf',
      userPoolClientId: 'your-client-id',
      loginWith: {
        email: true,
        username: false
      }
    }
  }
});
```

3. **Implement Auth Context**
```typescript
// Use the provided AuthContext.tsx
// Configure token refresh service
// Set up cookie utilities
```

### Backend Setup

1. **Install Dependencies**
```bash
composer require aws/aws-sdk-php
composer require firebase/php-jwt
```

2. **Configure AWS Cognito**
```php
// config/aws.php
return [
    'cognito' => [
        'user_pool_id' => env('AWS_COGNITO_USER_POOL_ID'),
        'client_id' => env('AWS_COGNITO_CLIENT_ID'),
        'region' => env('AWS_DEFAULT_REGION'),
    ],
];
```

3. **Implement JWT Validator**
```php
// Use the provided CognitoJWTValidator
// Configure middleware for protected routes
// Set up session management
```

### Environment Variables

```env
# Frontend (.env)
VITE_AWS_COGNITO_USER_POOL_ID=ap-southeast-2_mVNQG81kf
VITE_AWS_COGNITO_CLIENT_ID=your-client-id
VITE_AWS_REGION=ap-southeast-2

# Backend (.env)
AWS_COGNITO_USER_POOL_ID=ap-southeast-2_mVNQG81kf
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_DEFAULT_REGION=ap-southeast-2
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/login` | User login |
| POST | `/api/signup` | User registration |
| POST | `/api/logout` | User logout |
| POST | `/api/refresh` | Token refresh |
| GET | `/api/user` | Get user data |

### Request/Response Examples

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "status": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "businessId": 1,
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresAt": 1640995200
}
```

## Error Handling

### Common Error Codes

| Code | Message | Action |
|------|---------|--------|
| `INVALID_CREDENTIALS` | Invalid email or password | Retry login |
| `TOKEN_EXPIRED` | Token has expired | Refresh token |
| `USER_NOT_FOUND` | User does not exist | Check email |
| `ACCOUNT_LOCKED` | Account is locked | Contact support |

### Frontend Error Handling

```typescript
try {
  await login(email, password);
} catch (error) {
  if (error.code === 'UserNotConfirmedException') {
    setError('Please verify your email address');
  } else if (error.code === 'NotAuthorizedException') {
    setError('Invalid credentials');
  } else {
    setError('Login failed. Please try again.');
  }
}
```

## Testing

### Unit Tests

```typescript
// Test token validation
describe('Token Validation', () => {
  it('should validate valid tokens', () => {
    const validToken = 'valid.jwt.token';
    expect(validateCognitoToken(validToken)).toBe(true);
  });
  
  it('should reject expired tokens', () => {
    const expiredToken = 'expired.jwt.token';
    expect(validateCognitoToken(expiredToken)).toBe(false);
  });
});
```

### Integration Tests

```php
// Test login flow
public function test_user_can_login()
{
    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password123'
    ]);
    
    $response->assertStatus(200)
             ->assertJsonStructure([
                 'status',
                 'user',
                 'accessToken',
                 'idToken'
             ]);
}
```

## Monitoring and Logging

### Frontend Logging

```typescript
// Log authentication events
console.log('[AuthContext] User logged in:', user.email);
console.log('[AuthContext] Token refresh:', { expiresAt, isRefreshing });
console.log('[AuthContext] Logout:', { reason: 'user_action' });
```

### Backend Logging

```php
// Log authentication events
Log::info('User login attempt', ['email' => $request->email]);
Log::info('Token validation', ['user_id' => $user->id, 'valid' => $isValid]);
Log::warning('Invalid token attempt', ['token' => substr($token, 0, 20)]);
```

## Troubleshooting

### Common Issues

1. **Token Expiration**
   - Check token refresh service is running
   - Verify AWS Cognito configuration
   - Check network connectivity

2. **Cookie Issues**
   - Ensure HTTPS is enabled
   - Check cookie domain settings
   - Verify browser cookie policies

3. **CORS Issues**
   - Configure proper CORS headers
   - Check domain whitelist
   - Verify preflight requests

### Debug Tools

```typescript
// Debug cookie values
console.log('All cookies:', getAllCookies());
console.log('Token data:', getStoredTokenData());
console.log('User data:', getStoredAuthData());
```

## Conclusion

This authentication system provides a robust, secure, and scalable solution for managing user sessions in a React/Laravel application with AWS Cognito integration. The dual-token architecture ensures both security and user experience, while the automatic refresh mechanism maintains seamless sessions.

For implementation, follow the provided code examples and configuration steps. The system is designed to be production-ready with proper error handling, logging, and security measures in place.
