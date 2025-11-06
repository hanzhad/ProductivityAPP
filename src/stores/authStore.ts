import { createSignal } from 'solid-js';
import googleService from '../utils/google/google.service';

const [isAuthenticated, setIsAuthenticated] = createSignal(false);
const [userEmail, setUserEmail] = createSignal<string | null>(null);

export const useAuthStore = () => {
  const updateAuthState = () => {
    const signedIn = googleService.isSignedIn();
    setIsAuthenticated(signedIn);

    if (signedIn) {
      googleService.getUserProfile().then((profile) => {
        console.log('User Profile:', profile);

        setUserEmail(profile.email);
      });
    } else {
      setUserEmail(null);
    }
  };

  return {
    isAuthenticated,
    userEmail,
    updateAuthState,
  };
};
