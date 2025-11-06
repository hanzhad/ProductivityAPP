/**
 * Token data structure for storage
 */
export interface StoredToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  scope: string;
  stored_at: number;
}

/**
 * TokenStorage - Handles token persistence in localStorage
 * This service manages saving, loading, and clearing OAuth tokens
 */
export class TokenStorage {
  private static readonly STORAGE_KEY = 'google_oauth_token';
  private static readonly PROFILE_STORAGE_KEY = 'google_user_profile';
  private static readonly TOKEN_VERSION = '1.0';
  private static readonly PROFILE_VERSION = '1.0';

  /**
   * Save token to localStorage
   */
  public static saveToken(token: any): void {
    try {
      const storedToken: StoredToken = {
        access_token: token.access_token,
        token_type: token.token_type || 'Bearer',
        expires_in: token.expires_in || 3600,
        expires_at: token.expires_at || Date.now() + (token.expires_in || 3600) * 1000,
        scope: token.scope,
        stored_at: Date.now(),
      };

      const dataToStore = {
        version: this.TOKEN_VERSION,
        token: storedToken,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToStore));
      console.log('✓ Token saved to localStorage', {
        expires_at: new Date(storedToken.expires_at).toISOString(),
        scopes: storedToken.scope,
      });
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
      // Don't throw - failing to save token shouldn't break the app
    }
  }

  /**
   * Load token from localStorage
   */
  public static loadToken(): StoredToken | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        console.log('No token found in localStorage');
        return null;
      }

      const data = JSON.parse(stored);

      // Check version compatibility
      if (data.version !== this.TOKEN_VERSION) {
        console.warn('Token version mismatch, clearing old token');
        this.clearToken();
        return null;
      }

      const token: StoredToken = data.token;

      // Validate token structure
      if (!token.access_token || !token.expires_at) {
        console.warn('Invalid token structure, clearing');
        this.clearToken();
        return null;
      }

      console.log('✓ Token loaded from localStorage', {
        expires_at: new Date(token.expires_at).toISOString(),
        age_hours: ((Date.now() - token.stored_at) / (1000 * 60 * 60)).toFixed(2),
      });

      return token;
    } catch (error) {
      console.error('Error loading token from localStorage:', error);
      this.clearToken();
      return null;
    }
  }

  /**
   * Check if stored token is expired
   */
  public static isTokenExpired(token: StoredToken): boolean {
    const now = Date.now();
    const expiresAt = token.expires_at;
    const bufferTime = 60000; // 60 seconds buffer

    return expiresAt <= now + bufferTime;
  }

  /**
   * Check if stored token is valid
   */
  public static isTokenValid(token: StoredToken | null): boolean {
    if (!token) {
      return false;
    }

    // Check if token has required fields
    if (!token.access_token || !token.expires_at) {
      return false;
    }

    // Check if token is not expired
    if (this.isTokenExpired(token)) {
      console.log('Stored token is expired');
      return false;
    }

    return true;
  }

  /**
   * Clear token from localStorage
   */
  public static clearToken(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('✓ Token cleared from localStorage');
    } catch (error) {
      console.error('Error clearing token from localStorage:', error);
    }
  }

  /**
   * Get token expiration info
   */
  public static getTokenExpirationInfo(token: StoredToken | null): {
    isExpired: boolean;
    expiresAt: string | null;
    expiresInMinutes: number | null;
  } {
    if (!token) {
      return {
        isExpired: true,
        expiresAt: null,
        expiresInMinutes: null,
      };
    }

    const now = Date.now();
    const expiresAt = token.expires_at;
    const isExpired = this.isTokenExpired(token);
    const expiresInMinutes = Math.floor((expiresAt - now) / 60000);

    return {
      isExpired,
      expiresAt: new Date(expiresAt).toISOString(),
      expiresInMinutes,
    };
  }

  /**
   * Save user profile to localStorage
   */
  public static saveProfile(profile: any): void {
    try {
      const dataToStore = {
        version: this.PROFILE_VERSION,
        profile: profile,
        stored_at: Date.now(),
      };

      localStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(dataToStore));
      console.log('✓ User profile saved to localStorage');
    } catch (error) {
      console.error('Error saving profile to localStorage:', error);
    }
  }

  /**
   * Load user profile from localStorage
   */
  public static loadProfile(): any | null {
    try {
      const stored = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored);

      // Check version compatibility
      if (data.version !== this.PROFILE_VERSION) {
        console.warn('Profile version mismatch, clearing old profile');
        this.clearProfile();
        return null;
      }

      console.log('✓ User profile loaded from localStorage');
      return data.profile;
    } catch (error) {
      console.error('Error loading profile from localStorage:', error);
      this.clearProfile();
      return null;
    }
  }

  /**
   * Clear user profile from localStorage
   */
  public static clearProfile(): void {
    try {
      localStorage.removeItem(this.PROFILE_STORAGE_KEY);
      console.log('✓ User profile cleared from localStorage');
    } catch (error) {
      console.error('Error clearing profile from localStorage:', error);
    }
  }
}
