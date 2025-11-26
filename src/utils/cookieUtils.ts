/**
 * Cookie utility functions for secure token storage
 */

interface CookieOptions {
  expires?: Date;
  maxAge?: number; // in seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean;
}

/**
 * Sets a cookie with the given name, value, and options
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  const {
    expires,
    maxAge,
    path = '/',
    domain,
    secure = true,
    sameSite = 'Strict',
    httpOnly = false
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // Add expiration
  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  } else if (maxAge) {
    cookieString += `; max-age=${maxAge}`;
  }

  // Add other options
  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;
  if (httpOnly) cookieString += '; httpOnly';

  document.cookie = cookieString;
};

/**
 * Gets a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  
  return null;
};

/**
 * Deletes a cookie by setting its expiration to the past
 */
export const deleteCookie = (name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void => {
  const { path = '/', domain } = options;
  
  // Set expiration to past date to delete the cookie
  const pastDate = new Date(0);
  
  setCookie(name, '', {
    expires: pastDate,
    path,
    domain,
    secure: true,
    sameSite: 'Strict'
  });
};

/**
 * Sets a cookie with expiration time in seconds from now
 */
export const setCookieWithExpiry = (name: string, value: string, maxAgeSeconds: number): void => {
  setCookie(name, value, {
    maxAge: maxAgeSeconds,
    path: '/',
    secure: true,
    sameSite: 'Strict'
  });
};

/**
 * Checks if a cookie is expired
 */
export const isCookieExpired = (name: string): boolean => {
  const cookies = document.cookie.split(';');
  const nameEQ = `${encodeURIComponent(name)}=`;
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      // Extract max-age or expires
      const maxAgeMatch = cookie.match(/max-age=(\d+)/i);
      if (maxAgeMatch) {
        const maxAge = parseInt(maxAgeMatch[1], 10);
        return maxAge <= 0;
      }
      
      const expiresMatch = cookie.match(/expires=([^;]+)/i);
      if (expiresMatch) {
        const expiresDate = new Date(expiresMatch[1]);
        const now = new Date();
        return expiresDate <= now;
      }
    }
  }
  
  return true;
};