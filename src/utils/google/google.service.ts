import { GoogleSDK } from './google.sdk';
import { GoogleAuth } from './google-auth.service';
import { GoogleCalendar } from './google-calendar.service';

class GoogleService {
  constructor(
    private readonly sdk: GoogleSDK,
    private readonly auth: GoogleAuth,
    private readonly calendar: GoogleCalendar
  ) {}

  static getInstance(clientId: string, apiKey: string, scopes: string) {
    if (!clientId || !apiKey) {
      throw new Error(
        'Google Calendar API credentials are not configured. Please set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in your .env file.'
      );
    }

    const googleSdk = new GoogleSDK({ apiKey });
    const googleAuth = new GoogleAuth(googleSdk, clientId, scopes);

    const googleCalendar = new GoogleCalendar(googleAuth);

    return new GoogleService(googleSdk, googleAuth, googleCalendar);
  }

  public async initialize() {
    await this.sdk.initialize();
    await this.auth.initialize();
  }

  public async signIn() {
    console.log('🔐 Starting sign-in process...');
    await this.initialize();
    await this.auth.signIn();
    console.log('🔐 Sign-in completed');

    // Verify authentication
    const isSignedIn = this.isSignedIn();
    console.log('Sign-in verification:', isSignedIn ? '✓ Success' : '✗ Failed');

    if (!isSignedIn) {
      throw new Error('Sign-in completed but user is not authenticated');
    }
  }

  public async refreshToken() {
    await this.auth.refreshTokenIfNeeded();
  }

  public getTokenInfo() {
    return this.auth.getTokenInfo();
  }

  public hasStoredCredentials(): boolean {
    const tokenInfo = this.auth.getTokenInfo();
    return tokenInfo?.inStorage === true;
  }

  public async signOut() {
    this.auth.signOut();
  }

  public isSignedIn() {
    return this.auth.isSignedIn();
  }

  public needsReauthentication(): boolean {
    return this.auth.needsReauthentication();
  }

  public async requestAdditionalScopes(): Promise<void> {
    return this.auth.requestAdditionalScopes();
  }

  public async getUserProfile() {
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to get profile');
    }
    return this.auth.getUserProfile();
  }

  public async fetchEvents(start: Date, end: Date) {
    return this.calendar.fetchEvents(start, end);
  }
}

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

const googleService = GoogleService.getInstance(
  import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  import.meta.env.VITE_GOOGLE_API_KEY || '',
  SCOPES
);

export default googleService;
