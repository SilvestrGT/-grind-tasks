/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCheck } from 'lucide-react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { useRef } from 'react';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { TaskComposer } from './components/TaskComposer';
import { TaskItem } from './components/TaskItem';
import { TaskSearchBar } from './components/TaskSearchBar';
import { TaskStats } from './components/TaskStats';
import { useTasks } from './hooks/useTasks';

function formatHeaderDate(): string {
  const raw = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function App() {
  const {
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
    totalCount,
    completedCount,
    activeCount,
    completionRate,
    overdueCount,
    upcomingDeadlines,
  } = useTasks();

  const inputRef = useRef<HTMLInputElement>(null);

  const hasSearch = searchQuery.trim().length > 0;
  const hasActiveFilters =
    hasSearch || categoryFilter !== 'All' || filter !== 'all';

  const emptyMessage =
    totalCount === 0
      ? 'Список задач пуст'
      : hasSearch
        ? 'Ничего не найдено'
        : categoryFilter !== 'All'
          ? `Нет задач в категории «${categoryFilter}»`
          : filter === 'active'
            ? 'Все задачи выполнены'
            : 'Нет выполненных задач';

  const emptyHint =
    totalCount === 0
      ? 'Добавьте первую задачу сверху, чтобы начать.'
      : hasSearch
        ? 'Попробуйте изменить поисковый запрос или сбросить фильтры.'
        : categoryFilter !== 'All'
          ? 'Выберите другую категорию или сбросьте фильтры.'
          : filter === 'active'
            ? 'Отличная работа — активных задач не осталось.'
            : 'Отметьте задачу галочкой, и она появится здесь.';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-[#0A0B0E] text-zinc-100">
        <header className="border-b border-white/[0.07]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
            <span className="text-lg font-semibold tracking-tight text-zinc-100 whitespace-nowrap shrink-0">
              TaskFlow
            </span>

            <span className="truncate text-sm text-zinc-400">
              {formatHeaderDate()}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[310px_1fr] lg:gap-10">
            <div className="lg:sticky lg:top-8">
              <TaskStats
                totalCount={totalCount}
                completedCount={completedCount}
                activeCount={activeCount}
                completionRate={completionRate}
                overdueCount={overdueCount}
                upcomingDeadlines={upcomingDeadlines}
                filter={filter}
                onFilterChange={setFilter}
                onClearCompleted={clearCompleted}
              />
            </div>

            <section
              aria-label="Список задач"
              className="flex min-w-0 flex-col gap-4"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 text-balance sm:text-3xl">
                  Фокус на день
                </h1>
                <span className="hidden font-mono text-xs tabular-nums text-zinc-500 sm:inline">
                  Выполнено {completedCount} / {totalCount}
                </span>
              </div>

              <TaskComposer onAdd={addTask} inputRef={inputRef} />

              <div className="flex flex-col gap-3">
                <TaskSearchBar value={searchQuery} onChange={setSearchQuery} />
                <CategoryFilterBar
                  selectedCategory={categoryFilter}
                  categoryCounts={categoryCounts}
                  onSelectCategory={setCategoryFilter}
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#12141A]">
                {filteredTasks.length > 0 ? (
                  <ul className="divide-y divide-white/[0.07]">
                    <AnimatePresence initial={false}>
                      {filteredTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          onDelete={deleteTask}
                          onUpdate={updateTask}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0A0B0E] text-zinc-400">
                      <CheckCheck className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-zinc-200">
                        {emptyMessage}
                      </p>
                      <p className="text-xs text-zinc-500">{emptyHint}</p>
                    </div>
                    {totalCount === 0 ? (
                      <button
                        type="button"
                        onClick={() => inputRef.current?.focus()}
                        className="mt-1 min-h-[40px] rounded-lg border border-white/[0.1] bg-[#0A0B0E] px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20 hover:text-white whitespace-nowrap"
                      >
                        Добавить первую задачу
                      </button>
                    ) : (
                      hasActiveFilters && (
                        <button
                          type="button"
                          onClick={() => {
                            setFilter('all');
                            setCategoryFilter('All');
                            setSearchQuery('');
                          }}
                          className="mt-1 min-h-[40px] rounded-lg border border-white/[0.1] bg-[#0A0B0E] px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20 hover:text-white whitespace-nowrap"
                        >
                          Сбросить фильтры
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {filteredTasks.length > 0 && (
                <p className="text-xs text-zinc-500">
                  Задачи автоматически сохраняются в браузере. Нажмите на
                  карандаш или дважды кликните по задаче для редактирования.
                </p>
              )}
            </section>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
