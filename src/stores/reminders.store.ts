import { createStore } from 'solid-js/store';
import { platformTimerManager } from '../utils/platform-timer.manager';

const TIME_OUT = 60 * 1000;

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags: string[];
  projectId?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  completed: boolean;
  notes?: string;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string;
  selectedTaskId: string | null;
  filterStatus: TaskStatus[];
  filterPriority: TaskPriority[];
  filterTags: string[];
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  viewFilter: 'all' | 'active' | 'completed';
  autoReloadInterval: string | null;
}

const [tasksStore, setTasksStore] = createStore<TasksState>({
  tasks: [],
  loading: false,
  error: '',
  selectedTaskId: null,
  filterStatus: [],
  filterPriority: [],
  filterTags: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
  viewFilter: 'all',
  autoReloadInterval: null,
});

export const useTasksStore = () => {
  const setTasks = (tasks: Task[]) => {
    setTasksStore('tasks', tasks);
  };

  const setLoading = (loading: boolean) => {
    setTasksStore('loading', loading);
  };

  const setError = (error: string) => {
    setTasksStore('error', error);
  };

  const addTask = (task: Task) => {
    setTasksStore('tasks', (tasks) => [...tasks, task]);
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasksStore('tasks', (t) => t.id === id, {
      ...updatedTask,
      updatedAt: new Date(),
    });
  };

  const removeTask = (id: string) => {
    setTasksStore('tasks', (tasks) => tasks.filter((t) => t.id !== id));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    const updates: Partial<Task> = {
      status,
      updatedAt: new Date(),
    };
    if (status === 'done') {
      updates.completedAt = new Date();
    }
    setTasksStore('tasks', (t) => t.id === id, updates);
  };

  const updateTaskPriority = (id: string, priority: TaskPriority) => {
    setTasksStore('tasks', (t) => t.id === id, {
      priority,
      updatedAt: new Date(),
    });
  };

  const selectTask = (id: string | null) => {
    setTasksStore('selectedTaskId', id);
  };

  const setFilterStatus = (statuses: TaskStatus[]) => {
    setTasksStore('filterStatus', statuses);
  };

  const setFilterPriority = (priorities: TaskPriority[]) => {
    setTasksStore('filterPriority', priorities);
  };

  const setFilterTags = (tags: string[]) => {
    setTasksStore('filterTags', tags);
  };

  const setSortBy = (sortBy: TasksState['sortBy']) => {
    setTasksStore('sortBy', sortBy);
  };

  const setSortOrder = (sortOrder: 'asc' | 'desc') => {
    setTasksStore('sortOrder', sortOrder);
  };

  const toggleSortOrder = () => {
    setTasksStore('sortOrder', tasksStore.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearFilters = () => {
    setTasksStore('filterStatus', []);
    setTasksStore('filterPriority', []);
    setTasksStore('filterTags', []);
  };

  const getTaskById = (id: string) => {
    return tasksStore.tasks.find((t) => t.id === id);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasksStore.tasks.filter((t) => t.status === status);
  };

  const getTasksByPriority = (priority: TaskPriority) => {
    return tasksStore.tasks.filter((t) => t.priority === priority);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasksStore.tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    );
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    tasksStore.tasks.forEach((task) => {
      task.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  };

  const reset = () => {
    // Stop auto-reload before resetting
    stopAutoReload();

    setTasksStore({
      tasks: [],
      loading: false,
      error: '',
      selectedTaskId: null,
      filterStatus: [],
      filterPriority: [],
      filterTags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      viewFilter: 'all',
      autoReloadInterval: null,
    });
  };

  const loadTasks = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError('');

      // Try to load from Apple Reminders if on iOS
      const { appleRemindersService } = await import('../utils/apple/apple-reminders.service');

      if (appleRemindersService.isIOS()) {
        try {
          const tasks = await appleRemindersService.getTasks(false);
          setTasks(tasks);
          return;
        } catch (error: any) {
          console.error(
            'Failed to load Apple Reminders, falling back to demo data:',
            error?.message || error?.code || error
          );
          if (!silent) {
            setError('errors.appleRemindersAccess');
          }
        }
      }

      // Fallback to demo tasks (only non-completed)
      const demoTasks: Task[] = [
        {
          id: '1',
          title: 'tasks.demoTask1Title',
          description: '',
          status: 'todo',
          completed: false,
          dueDate: new Date(Date.now() + 86400000 * 2),
          priority: 'high',
          notes: 'tasks.demoTask1Notes',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'tasks.demoTask2Title',
          description: '',
          status: 'todo',
          completed: false,
          dueDate: new Date(),
          priority: 'medium',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          title: 'tasks.demoTask4Title',
          description: '',
          status: 'todo',
          completed: false,
          dueDate: new Date(Date.now() + 86400000 * 7),
          priority: 'high',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setTasks(demoTasks);
    } catch (e: any) {
      console.error('Error loading tasks:', e?.message || e?.code || e);
      if (!silent) {
        setError('errors.loadingTasks');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const startAutoReload = async () => {
    // Stop any existing interval
    stopAutoReload();

    // Check if we're on iOS before starting auto-reload
    const { appleRemindersService } = await import('../utils/apple/apple-reminders.service');
    if (!appleRemindersService.isIOS()) {
      return;
    }

    // Set up platform-aware interval to reload tasks
    const timerId = platformTimerManager.setInterval(() => {
      loadTasks(true); // Silent reload
    }, TIME_OUT);

    setTasksStore('autoReloadInterval', timerId);
  };

  const stopAutoReload = () => {
    if (tasksStore.autoReloadInterval !== null && tasksStore.autoReloadInterval !== undefined) {
      platformTimerManager.clearInterval(tasksStore.autoReloadInterval);
      setTasksStore('autoReloadInterval', null);
    }
  };

  const toggleTask = (taskId: string) => {
    const task = getTaskById(taskId);
    if (task) {
      const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
      updateTaskStatus(taskId, newStatus);
      setTasksStore('tasks', (t) => t.id === taskId, {
        completed: newStatus === 'done',
      });
    }
  };

  const setViewFilter = (filter: 'all' | 'active' | 'completed') => {
    setTasksStore('viewFilter', filter);
  };

  return {
    store: tasksStore,
    setTasks,
    setLoading,
    setError,
    addTask,
    updateTask,
    removeTask,
    updateTaskStatus,
    updateTaskPriority,
    selectTask,
    setFilterStatus,
    setFilterPriority,
    setFilterTags,
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    clearFilters,
    getTaskById,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks,
    getAllTags,
    reset,
    loadTasks,
    toggleTask,
    setViewFilter,
    startAutoReload,
    stopAutoReload,
  };
};
