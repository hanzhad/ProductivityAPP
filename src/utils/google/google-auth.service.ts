import { GoogleSDK } from './google.sdk';
import { TokenStorage } from './token-storage.service';
import { GoogleUserProfileType } from '../../types/google.type';

/**
 * GoogleAuth - Handles Google OAuth authentication using Google Identity Services
 * This class manages user authentication, token management, and sign-in/sign-out operations
 * Depends on GoogleSDK for script loading and initialization
 */
export class GoogleAuth {
  private tokenClient: any = null;
  private tokenClientInitialized = false;
  private cachedUserProfile: GoogleUserProfileType | null = null;

  constructor(
    private readonly sdk: GoogleSDK,
    private readonly clientId: string,
    private readonly scopes: string
  ) {}

  /**
   * Initialize the authentication client
   */
  public async initialize(): Promise<void> {
    // Ensure SDK is initialized first
    await this.sdk.ensureInitialized();

    // Initialize token client if not already done
    if (!this.tokenClientInitialized) {
      this.initializeTokenClient();
    }

    // Try to restore token from localStorage
    await this.restoreTokenFromStorage();

    if (!this.sdk.isGapiLoaded()) {
      throw new Error('GAPI client not loaded');
    }
  }

  /**
   * Ensure the auth client is initialized before making calls
   */
  public async ensureInitialized(): Promise<void> {
    if (!this.tokenClientInitialized) {
      await this.initialize();
    }
  }

  /**
   * Check if user is currently signed in
   */
  public isSignedIn(): boolean {
    if (!this.sdk.isGapiLoaded()) {
      return false;
    }

    try {
      const client = this.sdk.getGapiClient();
      return client.getToken() !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get the current access token
   */
  public getToken(): any {
    if (!this.sdk.isGapiLoaded()) {
      return null;
    }

    try {
      return this.sdk.getGapiClient().getToken();
    } catch {
      return null;
    }
  }

  /**
   * Get the gapi client instance
   */
  public getGapiClient(): any {
    return this.sdk.getGapiClient();
  }

  /**
   * Sign in to Google account
   */
  public async signIn(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      try {
        if (!this.tokenClient) {
          reject(new Error('Token client not initialized'));
          return;
        }

        this.tokenClient.callback = async (resp: any) => {
          if (resp.error !== undefined) {
            reject(resp);
            return;
          }

          // CRITICAL: Set the token on the gapi client and save to localStorage
          // This is what makes the Calendar API calls authenticated
          if (resp.access_token) {
            try {
              // Clear any cached profile data (new sign-in should fetch fresh data)
              this.clearUserProfileCache();

              // Set token on gapi client
              const token = this.setToken(resp);

              // Save token to localStorage for persistence
              TokenStorage.saveToken(token);

              // Verify token is accessible
              const verifyToken = this.getToken();
              if (verifyToken && verifyToken.access_token) {
                resolve();
              } else {
                reject(new Error('Failed to set token on gapi client'));
              }
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('No access token received'));
          }
        };

        const token = this.getToken();
        if (token === null) {
          // Prompt the user to select a Google Account and ask for consent
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
          // Skip display of account chooser and consent dialog
          this.tokenClient.requestAccessToken({ prompt: '' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if the current token is expired
   */
  public isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token || !token.expires_at) {
      return true;
    }

    // Check if token expires in the next minute
    const expiresAt = token.expires_at;
    const now = Date.now();
    const isExpired = expiresAt <= now + 60000; // 60 seconds buffer

    return isExpired;
  }

  /**
   * Refresh the access token if expired
   */
  public async refreshTokenIfNeeded(): Promise<void> {
    if (this.isTokenExpired()) {
      await this.signIn();
    }
  }

  /**
   * Get detailed token information for debugging
   */
  public getTokenInfo(): any {
    const token = this.getToken();
    const storedToken = TokenStorage.loadToken();

    if (!token && !storedToken) {
      return {
        status: 'No token found',
        inMemory: false,
        inStorage: false,
      };
    }

    const expirationInfo = storedToken ? TokenStorage.getTokenExpirationInfo(storedToken) : null;

    return {
      status: token ? 'Active' : 'Stored only',
      inMemory: !!token,
      inStorage: !!storedToken,
      hasAccessToken: !!token?.access_token,
      tokenType: token?.token_type,
      expiresAt: token?.expires_at ? new Date(token.expires_at).toISOString() : null,
      isExpired: token ? this.isTokenExpired() : true,
      scopes: token?.scope,
      storage: storedToken
        ? {
            isValid: TokenStorage.isTokenValid(storedToken),
            expiresInMinutes: expirationInfo?.expiresInMinutes,
            storedAt: new Date(storedToken.stored_at).toISOString(),
          }
        : null,
    };
  }

  /**
   * Sign out from Google account
   */
  public signOut(): void {
    if (!this.sdk.isGisLoaded() || !this.sdk.isGapiLoaded()) {
      return;
    }

    try {
      const token = this.getToken();
      if (token !== null) {
        // Revoke the token with Google
        const gis = this.sdk.getGis();
        gis.revoke(token.access_token);

        // Clear token from gapi client
        this.sdk.getGapiClient().setToken(null);
      }

      // Clear token from localStorage
      TokenStorage.clearToken();

      // Clear cached user profile
      this.clearUserProfileCache();
    } catch (error) {
      // Still try to clear everything even if revocation fails
      TokenStorage.clearToken();
      this.clearUserProfileCache();
      throw error;
    }
  }

  /**
   * Check if the current token has the required scopes
   */
  public hasRequiredScopes(requiredScopes: string[]): boolean {
    const token = this.getToken();
    if (!token || !token.scope) {
      return false;
    }

    const tokenScopes = token.scope.toLowerCase();
    return requiredScopes.every((scope) => tokenScopes.includes(scope.toLowerCase()));
  }

  /**
   * Check if user needs to re-authenticate to get updated scopes
   */
  public needsReauthentication(): boolean {
    const requiredScopes = ['userinfo.profile', 'userinfo.email', 'calendar.readonly'];
    return !this.hasRequiredScopes(requiredScopes);
  }

  /**
   * Request additional scopes without signing out (incremental authorization)
   * This allows adding new permissions to an existing session
   */
  public async requestAdditionalScopes(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      try {
        if (!this.tokenClient) {
          reject(new Error('Token client not initialized'));
          return;
        }

        this.tokenClient.callback = async (resp: any) => {
          if (resp.error !== undefined) {
            reject(resp);
            return;
          }

          if (resp.access_token) {
            try {
              // Set the new token with updated scopes
              const token = this.setToken(resp);
              TokenStorage.saveToken(token);

              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('No access token received'));
          }
        };

        // Request additional scopes with consent prompt
        // This will show the consent screen with only the new scopes
        this.tokenClient.requestAccessToken({
          prompt: 'consent',
          // Include previously granted scopes to avoid losing them
          hint: this.getToken()?.access_token,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get current user profile information
   */
  public async getUserProfile(): Promise<GoogleUserProfileType> {
    if (!this.isSignedIn()) {
      throw new Error('User is not signed in');
    }

    // Return cached profile if available
    if (this.cachedUserProfile) {
      return this.cachedUserProfile;
    }

    try {
      // Get the access token
      const token = this.getToken();
      if (!token || !token.access_token) {
        throw new Error('No access token available. Please sign in again.');
      }

      // Check if token has required scopes
      const requiredScopes = ['userinfo.profile', 'userinfo.email'];
      if (!this.hasRequiredScopes(requiredScopes)) {
        throw new Error(
          '⚠️  Your session needs to be refreshed. Please sign out and sign in again to access your profile.'
        );
      }

      // Fetch user profile using Google OAuth2 userinfo endpoint
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error(
            'Authentication failed. Your session may have expired. Please sign in again.'
          );
        }

        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }

      const userInfo = await response.json();

      this.cachedUserProfile = {
        id: userInfo.id || '',
        name: userInfo.name || '',
        givenName: userInfo.given_name || '',
        familyName: userInfo.family_name || '',
        email: userInfo.email || '',
        imageUrl: userInfo.picture || '',
      };

      console.log('User profile fetched and cached:', {
        name: this.cachedUserProfile.name,
        email: this.cachedUserProfile.email,
      });
      return this.cachedUserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      this.clearUserProfileCache();
      throw error;
    }
  }

  /**
   * Restore token from localStorage if available and valid
   */
  private async restoreTokenFromStorage(): Promise<void> {
    const storedToken = TokenStorage.loadToken();

    if (!storedToken) {
      console.log('No stored token to restore');
      this.clearUserProfileCache();
      return;
    }

    if (!TokenStorage.isTokenValid(storedToken)) {
      console.log('Stored token is invalid or expired, clearing');
      TokenStorage.clearToken();
      this.clearUserProfileCache();
      return;
    }

    // Check if stored token has the minimum required scopes
    // If not, clear it to force re-authentication with new scopes
    const requiredScopes = ['calendar'];
    const tokenScope = storedToken.scope?.toLowerCase() || '';
    const hasMinimumScopes = requiredScopes.some((scope) => tokenScope.includes(scope));

    if (!hasMinimumScopes) {
      console.log('⚠️  Stored token has incompatible scopes, clearing for re-authentication');
      console.log('   Old scopes:', storedToken.scope);
      console.log('   This is a one-time migration - please sign in again');
      TokenStorage.clearToken();
      this.clearUserProfileCache();
      return;
    }

    try {
      // Set the token on gapi client
      this.setTokenInternal(storedToken);
      console.log('✓ Token restored from localStorage');

      // Verify the restored token works
      const currentToken = this.getToken();
      if (currentToken && currentToken.access_token) {
        console.log('✓ Restored token verified');
        const expirationInfo = TokenStorage.getTokenExpirationInfo(storedToken);
        console.log(`Token expires in ${expirationInfo.expiresInMinutes} minutes`);

        // Check if token has all required scopes
        const requiredScopes = ['userinfo.profile', 'userinfo.email', 'calendar.readonly'];
        if (!this.hasRequiredScopes(requiredScopes)) {
          console.log('ℹ️  Token restored but missing some required scopes');
          console.log('   Current scopes:', currentToken.scope);
          console.log('   Note: Additional permissions will be requested when needed');
        } else {
          console.log('✓ Token has all required scopes');
        }
      } else {
        console.warn('Restored token verification failed');
        TokenStorage.clearToken();
        this.clearUserProfileCache();
      }
    } catch (error) {
      console.error('Error restoring token:', error);
      TokenStorage.clearToken();
      this.clearUserProfileCache();
    }
  }

  /**
   * Initialize the OAuth token client
   */
  private initializeTokenClient(): void {
    if (this.tokenClient || !this.sdk.isGisLoaded()) {
      return;
    }

    try {
      const gis = this.sdk.getGis();
      this.tokenClient = gis.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes,
        callback: '', // Will be set dynamically during sign-in
      });
      this.tokenClientInitialized = true;
      console.log('Token client initialized');
    } catch (error) {
      console.error('Error initializing token client:', error);
      // Clear cache on error to prevent returning stale data
      this.clearUserProfileCache();
      throw error;
    }
  }

  /**
   * Set the OAuth token on the gapi client from OAuth response
   */
  private setToken(tokenResponse: any): any {
    const expiresAt = Date.now() + (tokenResponse.expires_in || 3600) * 1000;

    const token = {
      access_token: tokenResponse.access_token,
      token_type: tokenResponse.token_type || 'Bearer',
      expires_in: tokenResponse.expires_in || 3600,
      expires_at: expiresAt,
      scope: tokenResponse.scope,
    };

    this.setTokenInternal(token);
    return token;
  }

  /**
   * Internal method to set token on gapi client
   */
  private setTokenInternal(token: any): void {
    if (!this.sdk.isGapiLoaded()) {
      throw new Error('GAPI client not loaded');
    }

    try {
      const client = this.sdk.getGapiClient();

      // Set the token on the gapi client
      client.setToken(token);

      console.log('Token set on gapi client:', {
        expires_in_seconds: token.expires_in,
        expires_at: new Date(token.expires_at).toISOString(),
        scopes: token.scope,
      });
    } catch (error) {
      console.error('Error in setTokenInternal:', error);
      throw error;
    }
  }

  /**
   * Clear cached user profile data
   */
  private clearUserProfileCache(): void {
    this.cachedUserProfile = null;
    console.log('User profile cache cleared');
  }
}
