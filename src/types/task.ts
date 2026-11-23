export type TaskCategory = 'Study' | 'Work' | 'Personal' | 'Other';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type CategoryFilter = 'All' | TaskCategory;

export type TaskFilter = 'all' | 'active' | 'completed';

export type DueDateStatus =
  | 'overdue'
  | 'today'
  | 'upcoming'
  | 'scheduled'
  | 'completed';

export const TASK_CATEGORIES: readonly TaskCategory[] = [
  'Study',
  'Work',
  'Personal',
  'Other',
] as const;

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  'Low',
  'Medium',
  'High',
] as const;

export const CATEGORY_STYLES: Record<
  TaskCategory,
  {
    labelClass: string;
    activeButtonClass: string;
  }
> = {
  Study: {
    labelClass: 'text-sky-400',
    activeButtonClass: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  },
  Work: {
    labelClass: 'text-amber-400',
    activeButtonClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  Personal: {
    labelClass: 'text-violet-400',
    activeButtonClass: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  },
  Other: {
    labelClass: 'text-zinc-400',
    activeButtonClass: 'border-zinc-500/40 bg-zinc-500/15 text-zinc-200',
  },
};

export const PRIORITY_STYLES: Record<
  TaskPriority,
  {
    badgeClass: string;
    activeButtonClass: string;
  }
> = {
  Low: {
    badgeClass: 'border-zinc-700/70 bg-zinc-800/60 text-zinc-300',
    activeButtonClass: 'border-zinc-500/50 bg-zinc-700/40 text-zinc-100',
  },
  Medium: {
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    activeButtonClass: 'border-amber-500/45 bg-amber-500/15 text-amber-200',
  },
  High: {
    badgeClass: 'border-rose-500/35 bg-rose-500/12 text-rose-300',
    activeButtonClass: 'border-rose-500/50 bg-rose-500/20 text-rose-200',
  },
};

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null;
}
