import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type CategoryFilter,
  type DueDateStatus,
  type Task,
  type TaskCategory,
  type TaskFilter,
  type TaskPriority,
} from '../types/task';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidCategory(value: unknown): value is TaskCategory {
  return (
    typeof value === 'string' &&
    (TASK_CATEGORIES as readonly string[]).includes(value)
  );
}

export function isValidPriority(value: unknown): value is TaskPriority {
  return (
    typeof value === 'string' &&
    (TASK_PRIORITIES as readonly string[]).includes(value)
  );
}

export function isValidDueDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function getLocalTodayString(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDayDifference(fromDateStr: string, toDateStr: string): number {
  const from = parseLocalDate(fromDateStr).getTime();
  const to = parseLocalDate(toDateStr).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

export function getDueDateStatus(
  dueDate: string | null,
  completed: boolean,
  todayStr: string = getLocalTodayString()
): DueDateStatus | null {
  if (!dueDate || !isValidDueDate(dueDate)) return null;
  if (completed) return 'completed';

  const diffDays = getDayDifference(todayStr, dueDate);
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 3) return 'upcoming';
  return 'scheduled';
}

export function formatDueDateLabel(
  dueDate: string,
  completed: boolean,
  todayStr: string = getLocalTodayString()
): string {
  const status = getDueDateStatus(dueDate, completed, todayStr);
  const dateObj = parseLocalDate(dueDate);
  const formatted = dateObj.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  if (status === 'overdue') {
    return `Просрочено · ${formatted}`;
  }
  if (status === 'today') {
    return `Сегодня · ${formatted}`;
  }
  if (status === 'upcoming') {
    const diff = getDayDifference(todayStr, dueDate);
    return diff === 1 ? `Завтра · ${formatted}` : `Скоро · ${formatted}`;
  }
  return formatted;
}

export function normalizeTask(value: unknown): Task | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.completed !== 'boolean' ||
    typeof candidate.createdAt !== 'number'
  ) {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    completed: candidate.completed,
    createdAt: candidate.createdAt,
    category: isValidCategory(candidate.category) ? candidate.category : 'Other',
    priority: isValidPriority(candidate.priority) ? candidate.priority : 'Medium',
    dueDate: isValidDueDate(candidate.dueDate) ? candidate.dueDate : null,
  };
}

export function parseStoredTasks(raw: string): Task[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const result: Task[] = [];

  for (const item of parsed) {
    const normalized = normalizeTask(item);
    if (!normalized) continue;
    const normalizedTitle = normalized.title.trim().toLowerCase();
    if (!normalizedTitle) continue;
    if (seenIds.has(normalized.id) || seenTitles.has(normalizedTitle)) {
      continue;
    }
    seenIds.add(normalized.id);
    seenTitles.add(normalizedTitle);
    result.push(normalized);
  }

  return result;
}

export function hasDuplicateTitle(
  tasks: readonly Task[],
  rawTitle: string,
  excludeId?: string
): boolean {
  const normalized = rawTitle.trim().toLowerCase();
  if (!normalized) return false;
  return tasks.some(
    (task) =>
      task.id !== excludeId && task.title.trim().toLowerCase() === normalized
  );
}

export function filterTasks(
  tasks: readonly Task[],
  options: {
    status: TaskFilter;
    category: CategoryFilter;
    search: string;
  }
): Task[] {
  const query = options.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (options.status === 'active' && task.completed) return false;
    if (options.status === 'completed' && !task.completed) return false;
    if (options.category !== 'All' && task.category !== options.category) {
      return false;
    }
    if (query && !task.title.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });
}

export function computeTaskStats(
  tasks: readonly Task[],
  todayStr: string = getLocalTodayString()
) {
  const totalCount = tasks.length;
  let completedCount = 0;
  let overdueCount = 0;

  const deadlineCandidates: Task[] = [];

  for (const task of tasks) {
    if (task.completed) {
      completedCount += 1;
      continue;
    }

    if (task.dueDate) {
      const status = getDueDateStatus(task.dueDate, false, todayStr);
      if (status === 'overdue') {
        overdueCount += 1;
      }
      deadlineCandidates.push(task);
    }
  }

  const activeCount = totalCount - completedCount;
  const completionRate =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  deadlineCandidates.sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return {
    totalCount,
    completedCount,
    activeCount,
    completionRate,
    overdueCount,
    upcomingDeadlines: deadlineCandidates.slice(0, 4),
  };
}
