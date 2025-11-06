import { Component, createSignal, onMount, Show } from 'solid-js';
import { Button } from '@kobalte/core/button';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from '../utils/i18n';
import googleService from '../utils/google/google.service';

const GoogleAuthButton: Component = () => {
  const { t } = useI18n();
  const { isAuthenticated, userEmail, updateAuthState } = useAuthStore();
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string>('');
  const [isInitialized, setIsInitialized] = createSignal(false);

  onMount(async () => {
    try {
      setLoading(true);
      await googleService.initialize();
      setIsInitialized(true);
      updateAuthState();
    } catch (err) {
      console.error('Error initializing Google API:', err);
      setError(t('errors.googleApiInit'));
    } finally {
      setLoading(false);
    }
  });

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await googleService.signIn();
      updateAuthState();
    } catch (err) {
      console.error('Error signing in:', err);
      setError(t('errors.googleSignIn'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError('');
      await googleService.signOut();
      updateAuthState();
    } catch (err) {
      console.error('Error signing out:', err);
      setError(t('errors.googleSignOut'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="mb-6">
      <Show when={error()}>
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error()}
        </div>
      </Show>

      <Show when={!isInitialized()}>
        <div class="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          <span class="text-blue-800 dark:text-blue-200">{t('auth.initializing')}</span>
        </div>
      </Show>

      <Show when={isInitialized()}>
        <Show
          when={isAuthenticated()}
          fallback={
            <div class="flex flex-col gap-3">
              <div class="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200">
                {t('auth.signInPrompt')}
              </div>
              <Button
                onClick={handleSignIn}
                disabled={loading()}
                class="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
              >
                <Show when={loading()}>
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                </Show>
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('auth.signInWithGoogle')}
              </Button>
            </div>
          }
        >
          <div class="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50">
                <svg
                  class="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-green-800 dark:text-green-200">
                  {t('auth.signedInAs')}
                </p>
                <p class="text-sm text-green-700 dark:text-green-300">{userEmail()}</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              disabled={loading()}
              class="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {t('auth.signOut')}
            </Button>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default GoogleAuthButton;
