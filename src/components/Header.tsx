import { Component, createSignal, For, Show } from 'solid-js';
import { Language, useI18n } from '../utils/i18n';
import GoogleAuthButton from './GoogleAuthButton';

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'uk', label: 'УК' },
  { code: 'ru', label: 'РУ' },
];

const Header: Component = () => {
  const { t, locale, setLocale } = useI18n();

  const [shown, setShown] = createSignal(false);

  return (
    <>
      <div>
        <button
          class="absolute top-4 left-4 z-20 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700"
          onClick={() => setShown(!shown())}
          aria-label={shown() ? 'Close menu' : 'Open menu'}
        >
          <div class="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
            <Show when={!shown()}>
              <div class="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all" />
              <div class="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all" />
              <div class="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all" />
            </Show>
            <Show when={shown()}>
              <svg
                class="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Show>
          </div>
        </button>
      </div>

      <Show when={shown()}>
        <header class="absolute left-0 top-0 bg-gradient-to-b from-primary to-secondary text-white shadow-lg w-full max-w-xl pt-4 pb-4 h-screen z-10">
          <h1 class="text-2xl font-semibold flex-1 mt-[6px] mb-8 text-center">{t('app.title')}</h1>

          <div class="px-8">
            <GoogleAuthButton />
          </div>

          <div class="flex w-full justify-center">
            <div class="flex gap-1 bg-white/20 dark:bg-black/20 rounded-lg p-1">
              <For each={languages}>
                {(lang) => (
                  <button
                    class={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                      locale() === lang.code
                        ? 'bg-white dark:bg-gray-800 text-primary'
                        : 'text-white/70 hover:text-white/90 hover:bg-white/10 dark:hover:bg-white/20'
                    }`}
                    onClick={() => setLocale(lang.code)}
                    title={t(`language.${lang.code}`)}
                  >
                    {lang.label}
                  </button>
                )}
              </For>
            </div>
          </div>
        </header>
      </Show>
    </>
  );
};

export default Header;
