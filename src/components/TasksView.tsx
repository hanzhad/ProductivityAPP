import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { Button } from '@kobalte/core/button';
import { Checkbox } from '@kobalte/core/checkbox';
import { getLocaleDateFormat, useI18n } from '../utils/i18n';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

const TasksView: Component = () => {
  const { t, locale } = useI18n();
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string>('');
  const [filter, setFilter] = createSignal<'all' | 'active' | 'completed'>('all');

  onMount(async () => {
    await loadTasks();
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const demoTasks: Task[] = [
        {
          id: '1',
          title: t('tasks.demoTask1Title'),
          completed: false,
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          priority: 'high',
          notes: t('tasks.demoTask1Notes'),
        },
        {
          id: '2',
          title: t('tasks.demoTask2Title'),
          completed: false,
          dueDate: new Date().toISOString(),
          priority: 'medium',
        },
        {
          id: '3',
          title: t('tasks.demoTask3Title'),
          completed: true,
          priority: 'low',
        },
        {
          id: '4',
          title: t('tasks.demoTask4Title'),
          completed: false,
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          priority: 'high',
        },
      ];

      setTasks(demoTasks);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setError(t('errors.loadingTasks'));
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = () => {
    const allTasks = tasks();
    switch (filter()) {
      case 'active':
        return allTasks.filter((t) => !t.completed);
      case 'completed':
        return allTasks.filter((t) => t.completed);
      default:
        return allTasks;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeFormat = getLocaleDateFormat(locale());
    return date.toLocaleDateString(localeFormat, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
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

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks().map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
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
    <div class="max-w-[400px] mx-auto">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('tasks.title')}</h2>
        <Button
          onClick={loadTasks}
          disabled={loading()}
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
        >
          {loading() ? t('common.refreshing') : t('common.refresh')}
        </Button>
      </div>

      <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200">
        {t('alerts.appleRemindersPlugin')}
      </div>

      <div class="flex gap-2 mb-6 flex-wrap">
        <Button
          onClick={() => setFilter('all')}
          class={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            filter() === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('common.all')} ({tasks().length})
        </Button>
        <Button
          onClick={() => setFilter('active')}
          class={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            filter() === 'active'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('common.active')} ({tasks().filter((t) => !t.completed).length})
        </Button>
        <Button
          onClick={() => setFilter('completed')}
          class={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            filter() === 'completed'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('common.completed')} ({tasks().filter((t) => t.completed).length})
        </Button>
      </div>

      <Show when={error()}>
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error()}
        </div>
      </Show>

      <Show when={loading()}>
        <div class="flex flex-col items-center justify-center py-12 gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p class="text-gray-600 dark:text-gray-400">{t('tasks.loadingTasks')}</p>
        </div>
      </Show>

      <Show when={!loading() && filteredTasks().length === 0}>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-12 text-center">
          <p class="text-xl text-gray-500 dark:text-gray-400">{t('tasks.noTasks')}</p>
        </div>
      </Show>

      <div class="flex flex-col gap-3">
        <For each={filteredTasks()}>
          {(task) => {
            const priorityBadge = getPriorityBadge(task.priority);
            return (
              <div
                class={`bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-5 transition-all ${task.completed ? 'opacity-60' : ''}`}
              >
                <div class="flex gap-4 items-start">
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    class="pt-1"
                  >
                    <Checkbox.Input class="peer sr-only" />
                    <Checkbox.Control class="h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 dark:peer-focus:ring-offset-gray-800 data-[checked]:bg-primary data-[checked]:border-primary flex items-center justify-center">
                      <Checkbox.Indicator>
                        <svg class="h-3 w-3 text-white" viewBox="0 0 12 10" fill="none">
                          <path
                            d="M1 5L4.5 8.5L11 1.5"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                  </Checkbox>
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
                        📅 {formatDate(task.dueDate!)}
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
  );
};

export default TasksView;
