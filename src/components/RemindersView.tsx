import { Component, For, onCleanup, onMount, Show } from 'solid-js';
import { App } from '@capacitor/app';
import { getLocaleDateFormat, useI18n } from '../utils/i18n';
import { TaskPriority, useTasksStore } from '../stores';

const RemindersView: Component = () => {
  const { t, locale } = useI18n();
  const { store, loadTasks, stopAutoReload, startAutoReload } = useTasksStore();

  let appStateListener: any;

  onMount(async () => {
    await loadTasks();

    // Start auto-reload timer (will only work on iOS)
    await startAutoReload();

    // Listen for app state changes to resync tasks when app resumes
    appStateListener = await App.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        console.log('App resumed, resyncing tasks/reminders...');
        await loadTasks(true); // Silent reload to avoid showing loading spinner
      }
    });
  });

  onCleanup(() => {
    // Clean up app state listener
    if (appStateListener) {
      appStateListener.remove();
    }
    // Clean up any auto-reload intervals
    stopAutoReload();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeFormat = getLocaleDateFormat(locale());
    return date.toLocaleDateString(localeFormat, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const variants: Record<string, 'error' | 'warning' | 'success'> = {
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return {
      variant: variants[priority],
      label: t(`tasks.priority.${priority}` as const),
    };
  };

  const getBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
      medium: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
      low: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
    };
    return colors[priority] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('tasks.title')}</h2>
      </div>

      <Show when={store.error}>
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {store.error}
        </div>
      </Show>

      <Show when={store.loading}>
        <div class="flex flex-col items-center justify-center py-12 gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p class="text-gray-600 dark:text-gray-400">{t('tasks.loadingTasks')}</p>
        </div>
      </Show>

      <Show when={!store.loading && store.tasks.length === 0}>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-12 text-center">
          <p class="text-xl text-gray-500 dark:text-gray-400">{t('tasks.noTasks')}</p>
        </div>
      </Show>

      <div class="max-h-[calc(100vh-12rem)] overflow-y-auto scroll-smooth pr-2">
        <div class="flex flex-col gap-3">
          <For each={store.tasks}>
            {(task) => {
              const priorityBadge = getPriorityBadge(task.priority);
              return (
                <div
                  class={`bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-5 transition-all ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div class="flex gap-4 items-start">
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-start mb-2 gap-3">
                        <h3
                          class={`text-base font-semibold text-gray-900 dark:text-gray-100 flex-1 break-words ${task.completed ? 'line-through' : ''}`}
                        >
                          {task.title}
                        </h3>
                        <span
                          class={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(task.priority)}`}
                        >
                          {priorityBadge.label}
                        </span>
                      </div>
                      <Show when={task.dueDate}>
                        <div class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          📅 {formatDate(task.dueDate!.toISOString())}
                        </div>
                      </Show>
                      <Show when={task.notes}>
                        <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {task.notes}
                        </div>
                      </Show>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};

export default RemindersView;
