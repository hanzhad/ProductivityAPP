/**
 * Google User Profile interface
 * Based on Google OAuth2 userinfo endpoint response
 */
export interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale?: string;
}

/**
 * Simplified user profile for application use
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  imageUrl: string;
  isVerified: boolean;
}
