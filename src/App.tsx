import { Component, createSignal, onMount, Show, For } from 'solid-js';
import { Button } from '@kobalte/core/button';
import { Tabs } from '@kobalte/core/tabs';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';
import TasksView from './components/TasksView';
import { requestPermissions } from './services/calendar.service';
import { useI18n, Language } from './utils/i18n';

type View = 'calendar' | 'notes' | 'tasks';

const App: Component = () => {
  const { t, locale, setLocale } = useI18n();
  const [currentView, setCurrentView] = createSignal<View>('calendar');
  const [permissionsGranted, setPermissionsGranted] = createSignal(false);
  const [error, setError] = createSignal<string>('');

  onMount(async () => {
    try {
      const granted = await requestPermissions();
      setPermissionsGranted(granted);
      if (!granted) {
        setError(t('errors.permissionsRequired'));
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError(t('errors.requestingPermissions'));
    }
  });

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'uk', label: 'УК' },
    { code: 'ru', label: 'РУ' }
  ];

  return (
    <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header class="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
        <div class="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center gap-4">
          <h1 class="text-2xl font-semibold flex-1">{t('app.title')}</h1>
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

      <Tabs value={currentView()} onChange={setCurrentView} class="flex-1 flex flex-col">
        <Tabs.List class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div class="flex gap-1 px-4 overflow-x-auto">
            <Tabs.Trigger
              value="calendar"
              class="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 data-[selected]:border-primary data-[selected]:text-primary"
            >
              {t('tabs.calendar')}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="notes"
              class="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 data-[selected]:border-primary data-[selected]:text-primary"
            >
              {t('tabs.notes')}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="tasks"
              class="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 data-[selected]:border-primary data-[selected]:text-primary"
            >
              {t('tabs.tasks')}
            </Tabs.Trigger>
          </div>
        </Tabs.List>

        <main class="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Show when={error()}>
            <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-center">
              <p class="mb-3 text-red-800 dark:text-red-200 font-medium">{error()}</p>
              <Button
                onClick={async () => {
                  const granted = await requestPermissions();
                  setPermissionsGranted(granted);
                  if (granted) setError('');
                }}
                class="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
              >
                {t('common.retry')}
              </Button>
            </div>
          </Show>

          <Show when={permissionsGranted()}>
            <Tabs.Content value="calendar">
              <CalendarView />
            </Tabs.Content>
            <Tabs.Content value="notes">
              <NotesView />
            </Tabs.Content>
            <Tabs.Content value="tasks">
              <TasksView />
            </Tabs.Content>
          </Show>
        </main>
      </Tabs>
    </div>
  );
};

export default App;
