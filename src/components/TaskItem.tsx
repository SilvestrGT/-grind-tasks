import { AlertCircle, Calendar, Check, Pencil, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { TaskMutationResult, UpdateTaskInput } from '../hooks/useTasks';
import {
  CATEGORY_STYLES,
  PRIORITY_STYLES,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type Task,
  type TaskCategory,
  type TaskPriority,
} from '../types/task';
import { formatDueDateLabel, getDueDateStatus } from '../utils/taskUtils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: UpdateTaskInput) => TaskMutationResult;
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftCategory, setDraftCategory] = useState<TaskCategory>(
    task.category
  );
  const [draftPriority, setDraftPriority] = useState<TaskPriority>(
    task.priority
  );
  const [draftDueDate, setDraftDueDate] = useState(task.dueDate ?? '');
  const [editError, setEditError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraftTitle(task.title);
    setDraftCategory(task.category);
    setDraftPriority(task.priority);
    setDraftDueDate(task.dueDate ?? '');
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftTitle(task.title);
    setDraftCategory(task.category);
    setDraftPriority(task.priority);
    setDraftDueDate(task.dueDate ?? '');
    setEditError(null);
    setIsEditing(false);
  };

  const commitEdit = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      setEditError('Название задачи не может быть пустым.');
      return;
    }

    const result = onUpdate(task.id, {
      title: trimmed,
      category: draftCategory,
      priority: draftPriority,
      dueDate: draftDueDate || null,
    });

    if (result.ok) {
      setEditError(null);
      setIsEditing(false);
    } else if (result.reason === 'duplicate') {
      setEditError('Задача с таким названием уже существует.');
    }
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  };

  const dueDateStatus = getDueDateStatus(task.dueDate, task.completed);

  const dueDateTextClass =
    dueDateStatus === 'overdue'
      ? 'text-rose-400 font-medium'
      : dueDateStatus === 'today'
        ? 'text-amber-300 font-medium'
        : dueDateStatus === 'upcoming'
          ? 'text-sky-300'
          : 'text-zinc-500';

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={`group px-2 py-2.5 sm:px-3 transition-colors duration-150 ${
        isEditing
          ? 'bg-white/[0.03]'
          : dueDateStatus === 'overdue'
            ? 'bg-rose-500/[0.03] hover:bg-rose-500/[0.05]'
            : 'hover:bg-white/[0.025]'
      }`}
    >
      {isEditing ? (
        <div className="flex flex-col gap-3 px-2 py-1">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`edit-title-${task.id}`} className="sr-only">
              Название задачи
            </label>
            <input
              id={`edit-title-${task.id}`}
              ref={editInputRef}
              type="text"
              value={draftTitle}
              onChange={(e) => {
                setDraftTitle(e.target.value);
                if (editError) setEditError(null);
              }}
              onKeyDown={handleEditKeyDown}
              maxLength={240}
              className="min-h-[42px] w-full rounded-lg border border-white/20 bg-[#0A0B0E] px-3 py-1.5 text-[15px] text-zinc-100 focus:border-white/35 focus:outline-none"
            />
            {editError && (
              <p role="alert" className="text-xs text-rose-300">
                {editError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-500">Категория:</span>
              <div className="flex flex-wrap items-center gap-1">
                {TASK_CATEGORIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDraftCategory(item)}
                    className={`min-h-[34px] sm:min-h-[28px] rounded-md border px-2 py-0.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      draftCategory === item
                        ? CATEGORY_STYLES[item].activeButtonClass
                        : 'border-white/[0.08] bg-[#0A0B0E] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-500">Приоритет:</span>
              <div className="flex items-center gap-1">
                {TASK_PRIORITIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDraftPriority(item)}
                    className={`min-h-[34px] sm:min-h-[28px] rounded-md border px-2 py-0.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      draftPriority === item
                        ? PRIORITY_STYLES[item].activeButtonClass
                        : 'border-white/[0.08] bg-[#0A0B0E] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <label
                htmlFor={`edit-date-${task.id}`}
                className="text-xs text-zinc-500 whitespace-nowrap"
              >
                Срок:
              </label>
              <input
                id={`edit-date-${task.id}`}
                type="date"
                value={draftDueDate}
                onChange={(e) => setDraftDueDate(e.target.value)}
                className="min-h-[34px] sm:min-h-[28px] rounded-md border border-white/[0.08] bg-[#0A0B0E] px-2 py-0.5 font-mono text-xs text-zinc-200 [color-scheme:dark] focus:border-white/25 focus:outline-none"
              />
              {draftDueDate && (
                <button
                  type="button"
                  onClick={() => setDraftDueDate('')}
                  aria-label="Удалить срок выполнения"
                  className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-md border border-white/[0.08] bg-[#0A0B0E] text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={cancelEdit}
              className="min-h-[38px] rounded-lg border border-white/[0.08] bg-[#0A0B0E] px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white whitespace-nowrap"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={commitEdit}
              className="min-h-[38px] rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-white whitespace-nowrap"
            >
              Сохранить
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 sm:items-center">
          <button
            type="button"
            role="checkbox"
            aria-checked={task.completed}
            aria-label={
              task.completed
                ? `Отметить «${task.title}» как невыполненную`
                : `Отметить «${task.title}» как выполненную`
            }
            onClick={() => onToggle(task.id)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-emerald-400"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 ${
                task.completed
                  ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                  : 'border-zinc-600 bg-transparent text-transparent group-hover:border-zinc-400'
              }`}
            >
              <Check className="h-3.5 w-3.5 stroke-[2.75]" aria-hidden="true" />
            </span>
          </button>

          <div className="min-w-0 flex-1 py-1.5">
            <p
              onDoubleClick={startEditing}
              title="Двойной клик для редактирования"
              className={`break-words text-[15px] leading-relaxed transition-colors duration-150 ${
                task.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'
              }`}
            >
              {task.title}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap transition-opacity duration-150 ${
                  PRIORITY_STYLES[task.priority].badgeClass
                } ${task.completed ? 'opacity-55' : 'opacity-100'}`}
              >
                {task.priority}
              </span>

              <span
                className={`text-xs font-medium tracking-wide whitespace-nowrap transition-opacity duration-150 ${
                  CATEGORY_STYLES[task.category].labelClass
                } ${task.completed ? 'opacity-55' : 'opacity-100'}`}
              >
                {task.category}
              </span>

              {task.dueDate && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">
                    ·
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-xs tabular-nums whitespace-nowrap ${
                      task.completed ? 'text-zinc-500 opacity-65' : dueDateTextClass
                    }`}
                  >
                    {dueDateStatus === 'overdue' ? (
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                    )}
                    <span>{formatDueDateLabel(task.dueDate, task.completed)}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={startEditing}
              aria-label={`Редактировать задачу «${task.title}»`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-zinc-200 focus-visible:text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-zinc-300 sm:opacity-60 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(task.id)}
              aria-label={`Удалить задачу «${task.title}»`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400 focus-visible:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-red-400 sm:opacity-60 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </motion.li>
  );
}
