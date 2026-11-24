import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CategoryFilter,
  Task,
  TaskCategory,
  TaskFilter,
  TaskPriority,
} from '../types/task';
import {
  computeTaskStats,
  filterTasks,
  getLocalTodayString,
  hasDuplicateTitle,
  isValidCategory,
  isValidDueDate,
  isValidPriority,
  parseStoredTasks,
} from '../utils/taskUtils';
import {
  clearImportFromUrl,
  mergeImportedTasks,
  readImportedTasks,
} from '../utils/importPlan';

const TASKS_STORAGE_KEY = 'minimal_tasks_v1';
const FILTER_STORAGE_KEY = 'minimal_tasks_filter_v1';
const CATEGORY_FILTER_STORAGE_KEY = 'minimal_tasks_category_filter_v1';

export type TaskMutationResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'duplicate' };

export interface NewTaskInput {
  category?: TaskCategory;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null;
}

function getRelativeDateString(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return getLocalTodayString(date);
}

function createDefaultTasks(): Task[] {
  return [
    {
      id: 'starter-1',
      title: 'Определить главную задачу на сегодня',
      completed: true,
      createdAt: Date.now() - 1000 * 60 * 45,
      category: 'Work',
      priority: 'High',
      dueDate: getRelativeDateString(0),
    },
    {
      id: 'starter-2',
      title: 'Подготовить список покупок к вечеру',
      completed: false,
      createdAt: Date.now() - 1000 * 60 * 20,
      category: 'Personal',
      priority: 'Medium',
      dueDate: getRelativeDateString(1),
    },
    {
      id: 'starter-3',
      title: 'Прочитать 20 страниц книги перед сном',
      completed: false,
      createdAt: Date.now() - 1000 * 60 * 5,
      category: 'Study',
      priority: 'Low',
      dueDate: null,
    },
  ];
}

function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadInitialTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    const imported = readImportedTasks();
    const base =
      raw === null
        ? imported.length > 0
          ? []
          : createDefaultTasks()
        : parseStoredTasks(raw);
    return imported.length > 0 ? mergeImportedTasks(base, imported) : base;
  } catch {
    return [];
  }
}

function loadInitialFilter(): TaskFilter {
  try {
    const saved = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved === 'all' || saved === 'active' || saved === 'completed') {
      return saved;
    }
    return 'all';
  } catch {
    return 'all';
  }
}

function loadInitialCategoryFilter(): CategoryFilter {
  try {
    const saved = window.localStorage.getItem(CATEGORY_FILTER_STORAGE_KEY);
    if (saved === 'All' || isValidCategory(saved)) {
      return saved;
    }
    return 'All';
  } catch {
    return 'All';
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadInitialTasks);
  const [filter, setFilter] = useState<TaskFilter>(loadInitialFilter);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(
    loadInitialCategoryFilter
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    clearImportFromUrl();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota or private mode errors gracefully
    }
  }, [tasks]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FILTER_STORAGE_KEY, filter);
    } catch {
      // Ignore storage quota or private mode errors gracefully
    }
  }, [filter]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CATEGORY_FILTER_STORAGE_KEY, categoryFilter);
    } catch {
      // Ignore storage quota or private mode errors gracefully
    }
  }, [categoryFilter]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TASKS_STORAGE_KEY && event.newValue !== null) {
        try {
          setTasks(parseStoredTasks(event.newValue));
        } catch {
          // Ignore malformed external updates
        }
      }
      if (
        event.key === FILTER_STORAGE_KEY &&
        (event.newValue === 'all' ||
          event.newValue === 'active' ||
          event.newValue === 'completed')
      ) {
        setFilter(event.newValue);
      }
      if (
        event.key === CATEGORY_FILTER_STORAGE_KEY &&
        (event.newValue === 'All' || isValidCategory(event.newValue))
      ) {
        setCategoryFilter(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addTask = useCallback(
    (rawTitle: string, options: NewTaskInput = {}): TaskMutationResult => {
      const title = rawTitle.trim();
      if (!title) {
        return { ok: false, reason: 'empty' };
      }

      if (hasDuplicateTitle(tasks, title)) {
        return { ok: false, reason: 'duplicate' };
      }

      const newTask: Task = {
        id: createTaskId(),
        title,
        completed: false,
        createdAt: Date.now(),
        category: isValidCategory(options.category) ? options.category : 'Other',
        priority: isValidPriority(options.priority) ? options.priority : 'Medium',
        dueDate: isValidDueDate(options.dueDate) ? options.dueDate : null,
      };

      setTasks((prev) => {
        if (hasDuplicateTitle(prev, title)) return prev;
        return [newTask, ...prev];
      });
      return { ok: true };
    },
    [tasks]
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const updateTask = useCallback(
    (id: string, updates: UpdateTaskInput): TaskMutationResult => {
      const title = updates.title.trim();
      if (!title) {
        return { ok: false, reason: 'empty' };
      }

      if (hasDuplicateTitle(tasks, title, id)) {
        return { ok: false, reason: 'duplicate' };
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                title,
                category: isValidCategory(updates.category)
                  ? updates.category
                  : task.category,
                priority: isValidPriority(updates.priority)
                  ? updates.priority
                  : task.priority,
                dueDate: isValidDueDate(updates.dueDate)
                  ? updates.dueDate
                  : null,
              }
            : task
        )
      );
      return { ok: true };
    },
    [tasks]
  );

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  }, []);

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      All: tasks.length,
      Study: 0,
      Work: 0,
      Personal: 0,
      Other: 0,
    };

    for (const task of tasks) {
      counts[task.category] += 1;
    }

    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(
    () =>
      filterTasks(tasks, {
        status: filter,
        category: categoryFilter,
        search: searchQuery,
      }),
    [tasks, filter, categoryFilter, searchQuery]
  );

  return {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    categoryCounts,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    clearCompleted,
    ...stats,
  };
}
