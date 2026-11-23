import { Search, X } from 'lucide-react';

interface TaskSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function TaskSearchBar({ value, onChange }: TaskSearchBarProps) {
  return (
    <div className="relative flex items-center rounded-xl border border-white/[0.08] bg-[#12141A] transition-colors duration-150 focus-within:border-white/25">
      <Search
        className="pointer-events-none ml-3.5 h-4 w-4 shrink-0 text-zinc-500"
        aria-hidden="true"
      />
      <label htmlFor="task-search-input" className="sr-only">
        Поиск задач по названию
      </label>
      <input
        id="task-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск по задачам..."
        className="min-h-[44px] w-full min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Очистить поиск"
          className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-zinc-300"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
