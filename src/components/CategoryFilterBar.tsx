import {
  CATEGORY_STYLES,
  TASK_CATEGORIES,
  type CategoryFilter,
} from '../types/task';

interface CategoryFilterBarProps {
  selectedCategory: CategoryFilter;
  categoryCounts: Record<CategoryFilter, number>;
  onSelectCategory: (category: CategoryFilter) => void;
}

const FILTER_OPTIONS: readonly CategoryFilter[] = ['All', ...TASK_CATEGORIES];

export function CategoryFilterBar({
  selectedCategory,
  categoryCounts,
  onSelectCategory,
}: CategoryFilterBarProps) {
  return (
    <div
      role="group"
      aria-label="Фильтр по категориям"
      className="flex flex-wrap items-center gap-1.5"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = selectedCategory === option;
        const activeClass =
          option === 'All'
            ? 'border-white/20 bg-[#1D2029] text-zinc-100'
            : CATEGORY_STYLES[option].activeButtonClass;

        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectCategory(option)}
            className={`inline-flex min-h-[40px] sm:min-h-[34px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-zinc-300 ${
              isActive
                ? activeClass
                : 'border-white/[0.07] bg-[#12141A] text-zinc-400 hover:border-white/[0.15] hover:text-zinc-200'
            }`}
          >
            <span>{option}</span>
            <span
              className={`font-mono text-[11px] tabular-nums ${
                isActive ? 'opacity-85' : 'text-zinc-500'
              }`}
            >
              {categoryCounts[option]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
