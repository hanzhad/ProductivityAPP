import { Component, createSignal, onMount, For, Show } from 'solid-js';
import { Button } from '@kobalte/core/button';
import { useI18n, getLocaleDateFormat } from '../utils/i18n';

interface Note {
  id: string;
  title: string;
  content: string;
  createdDate: string;
  modifiedDate: string;
}

const NotesView: Component = () => {
  const { t, locale } = useI18n();
  const [notes, setNotes] = createSignal<Note[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string>('');

  onMount(async () => {
    await loadNotes();
  });

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError('');

      const demoNotes: Note[] = [
        {
          id: '1',
          title: t('notes.demoNote1Title'),
          content: t('notes.demoNote1Content'),
          createdDate: new Date().toISOString(),
          modifiedDate: new Date().toISOString()
        },
        {
          id: '2',
          title: t('notes.demoNote2Title'),
          content: t('notes.demoNote2Content'),
          createdDate: new Date(Date.now() - 86400000).toISOString(),
          modifiedDate: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          title: t('notes.demoNote3Title'),
          content: t('notes.demoNote3Content'),
          createdDate: new Date(Date.now() - 172800000).toISOString(),
          modifiedDate: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      setNotes(demoNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError(t('errors.loadingNotes'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeFormat = getLocaleDateFormat(locale());
    return date.toLocaleDateString(localeFormat, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('notes.title')}</h2>
        <Button
          onClick={loadNotes}
          disabled={loading()}
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
        >
          {loading() ? t('common.refreshing') : t('common.refresh')}
        </Button>
      </div>

      <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200">
        {t('alerts.appleNotesPlugin')}
      </div>

      <Show when={error()}>
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error()}
        </div>
      </Show>

      <Show when={loading()}>
        <div class="flex flex-col items-center justify-center py-12 gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-gray-600 dark:text-gray-400">{t('notes.loadingNotes')}</p>
        </div>
      </Show>

      <Show when={!loading() && notes().length === 0}>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-12 text-center">
          <p class="text-xl text-gray-500 dark:text-gray-400">{t('notes.noNotes')}</p>
        </div>
      </Show>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <For each={notes()}>
          {(note) => (
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-shadow p-5 active:scale-[0.98] flex flex-col min-h-[180px]">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{note.title}</h3>
              <div class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1 whitespace-pre-wrap">
                {note.content}
              </div>
              <div class="pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                📅 {formatDate(note.modifiedDate)}
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default NotesView;
