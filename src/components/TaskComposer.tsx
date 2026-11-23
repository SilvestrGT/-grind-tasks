import { Calendar, Plus, X } from 'lucide-react';
import { useState, type FormEvent, type RefObject } from 'react';
import type { TaskMutationResult } from '../hooks/useTasks';
import {
  CATEGORY_STYLES,
  PRIORITY_STYLES,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type TaskCategory,
  type TaskPriority,
} from '../types/task';

interface TaskComposerProps {
  onAdd: (
    title: string,
    options: {
      category: TaskCategory;
      priority: TaskPriority;
      dueDate: string | null;
    }
  ) => TaskMutationResult;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function TaskComposer({ onAdd, inputRef }: TaskComposerProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Other');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmed = title.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmed) return;

    const result = onAdd(trimmed, {
      category,
      priority,
      dueDate: dueDate || null,
    });

    if (result.ok) {
      setTitle('');
      setDueDate('');
      setErrorMessage(null);
    } else if (result.reason === 'duplicate') {
      setErrorMessage('Такая задача уже есть в списке.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl border border-white/[0.08] bg-[#12141A] transition-colors duration-150 focus-within:border-white/25"
    >
      <div className="flex items-center gap-2 p-2">
        <label htmlFor="new-task-input" className="sr-only">
          Новая задача
        </label>
        <input
          id="new-task-input"
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Добавить новую задачу..."
          maxLength={240}
          aria-invalid={errorMessage ? true : undefined}
          className="min-h-[44px] w-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!trimmed}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors duration-150 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Добавить</span>
        </button>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="border-t border-rose-500/20 bg-rose-500/5 px-4 py-2 text-xs text-rose-300"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-2.5 border-t border-white/[0.06] px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-xs text-zinc-500">Категория:</span>
            <div
              role="radiogroup"
              aria-label="Категория новой задачи"
              className="flex flex-wrap items-center gap-1"
            >
              {TASK_CATEGORIES.map((item) => {
                const isSelected = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setCategory(item)}
                    className={`min-h-[36px] sm:min-h-[30px] rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-zinc-300 ${
                      isSelected
                        ? CATEGORY_STYLES[item].activeButtonClass
                        : 'border-white/[0.07] bg-[#0A0B0E] text-zinc-400 hover:border-white/[0.14] hover:text-zinc-200'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-xs text-zinc-500">Приоритет:</span>
            <div
              role="radiogroup"
              aria-label="Приоритет новой задачи"
              className="flex items-center gap-1"
            >
              {TASK_PRIORITIES.map((item) => {
                const isSelected = priority === item;
                return (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setPriority(item)}
                    className={`min-h-[36px] sm:min-h-[30px] rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-zinc-300 ${
                      isSelected
                        ? PRIORITY_STYLES[item].activeButtonClass
                        : 'border-white/[0.07] bg-[#0A0B0E] text-zinc-400 hover:border-white/[0.14] hover:text-zinc-200'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <label
            htmlFor="new-task-due-date"
            className="flex items-center gap-1.5 text-xs text-zinc-500 whitespace-nowrap"
          >
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Срок:</span>
          </label>
          <input
            id="new-task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="min-h-[36px] sm:min-h-[30px] rounded-md border border-white/[0.08] bg-[#0A0B0E] px-2.5 py-1 font-mono text-xs text-zinc-200 [color-scheme:dark] focus:border-white/25 focus:outline-none"
          />
          {dueDate && (
            <button
              type="button"
              onClick={() => setDueDate('')}
              aria-label="Убрать срок"
              className="flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-md border border-white/[0.08] bg-[#0A0B0E] text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
