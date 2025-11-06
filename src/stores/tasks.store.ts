import { createStore } from 'solid-js/store';

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
    });
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');

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
          id: '3',
          title: 'tasks.demoTask3Title',
          description: '',
          status: 'done',
          completed: true,
          priority: 'low',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: new Date(),
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
    } catch (e) {
      setError('errors.loadingTasks');
    } finally {
      setLoading(false);
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
  };
};
