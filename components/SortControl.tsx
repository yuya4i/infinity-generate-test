'use client';

export type SortOption = 'newest' | 'oldest' | 'expiring-soon' | 'expiring-last';

interface SortControlProps {
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: '取得日（新しい順）' },
  { value: 'oldest', label: '取得日（古い順）' },
  { value: 'expiring-soon', label: '期限切れ（近い順）' },
  { value: 'expiring-last', label: '期限切れ（遠い順）' },
];

/**
 * ソートコントロールコンポーネント
 */
export default function SortControl({ sortBy, onSortChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
        並び替え:
      </label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
