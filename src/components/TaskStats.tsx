import { AlertCircle, Calendar } from 'lucide-react';
import type { Task, TaskFilter } from '../types/task';
import { formatDueDateLabel, getDueDateStatus } from '../utils/taskUtils';

interface TaskStatsProps {
  totalCount: number;
  completedCount: number;
  activeCount: number;
  completionRate: number;
  overdueCount: number;
  upcomingDeadlines: Task[];
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onClearCompleted: () => void;
}

export function TaskStats({
  totalCount,
  completedCount,
  activeCount,
  completionRate,
  overdueCount,
  upcomingDeadlines,
  filter,
  onFilterChange,
  onClearCompleted,
}: TaskStatsProps) {
  const filterOptions: Array<{
    id: TaskFilter;
    label: string;
    count: number;
  }> = [
    { id: 'all', label: 'Все', count: totalCount },
    { id: 'active', label: 'Активные', count: activeCount },
    { id: 'completed', label: 'Готовые', count: completedCount },
  ];

  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-white/[0.08] bg-[#12141A] p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium text-zinc-400">Статистика</h2>
          <span className="font-mono text-xs tabular-nums text-emerald-400">
            {completionRate}%
          </span>
        </div>

        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]"
          role="progressbar"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Процент выполнения задач"
        >
          <div
            className="h-full w-full origin-left rounded-full bg-emerald-500 transition-transform duration-200 ease-out"
            style={{ transform: `scaleX(${completionRate / 100})` }}
          />
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/[0.07] pt-1">
          <div className="flex flex-col gap-0.5 pr-3">
            <span className="text-[11px] text-zinc-500">Всего</span>
            <span className="font-mono text-xl font-semibold tabular-nums text-zinc-100">
              {totalCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 px-3">
            <span className="text-[11px] text-zinc-500">Готово</span>
            <span className="font-mono text-xl font-semibold tabular-nums text-emerald-400">
              {completedCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 pl-3">
            <span className="text-[11px] text-zinc-500">Осталось</span>
            <span className="font-mono text-xl font-semibold tabular-nums text-zinc-200">
              {activeCount}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/[0.07]" />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-zinc-400">Статус</span>
        <div
          role="tablist"
          aria-label="Фильтр задач по статусу"
          className="grid grid-cols-3 gap-1 rounded-lg border border-white/[0.06] bg-[#0A0B0E] p-1"
        >
          {filterOptions.map((option) => {
            const isActive = filter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onFilterChange(option.id)}
                className={`flex min-h-[40px] items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-zinc-300 ${
                  isActive
                    ? 'bg-[#1D2029] text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    isActive ? 'text-zinc-300' : 'text-zinc-500'
                  }`}
                >
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-white/[0.07]" />

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-zinc-400">
            Ближайшие дедлайны
          </span>
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium tabular-nums text-rose-400">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              <span>Просрочено: {overdueCount}</span>
            </span>
          )}
        </div>

        {upcomingDeadlines.length > 0 ? (
          <ul className="flex flex-col divide-y divide-white/[0.05]">
            {upcomingDeadlines.map((item) => {
              if (!item.dueDate) return null;
              const status = getDueDateStatus(item.dueDate, item.completed);
              const dateColor =
                status === 'overdue'
                  ? 'text-rose-400'
                  : status === 'today'
                    ? 'text-amber-300'
                    : status === 'upcoming'
                      ? 'text-sky-300'
                      : 'text-zinc-400';

              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <span className="min-w-0 truncate text-xs text-zinc-200">
                    {item.title}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 font-mono text-[11px] tabular-nums whitespace-nowrap ${dateColor}`}
                  >
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    <span>{formatDueDateLabel(item.dueDate, false)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500">Нет активных сроков</p>
        )}
      </div>

      {completedCount > 0 && (
        <>
          <div className="h-px bg-white/[0.07]" />
          <button
            type="button"
            onClick={onClearCompleted}
            className="min-h-[40px] w-full rounded-lg border border-white/[0.08] bg-transparent px-4 py-2 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 whitespace-nowrap"
          >
            Очистить выполненные ({completedCount})
          </button>
        </>
      )}
    </aside>
  );
}
