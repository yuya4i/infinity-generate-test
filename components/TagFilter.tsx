'use client';

import { useMemo } from 'react';
import { Coupon } from '@/types/coupon';

interface TagFilterProps {
  coupons: Coupon[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  filterMode: 'AND' | 'OR';
  onFilterModeChange: (mode: 'AND' | 'OR') => void;
}

/**
 * タグの色をハッシュ値から生成
 */
function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800',
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800',
  ];

  return colors[Math.abs(hash) % colors.length];
}

/**
 * タグフィルターコンポーネント
 * 全タグを使用頻度順に表示し、クリックでフィルタリング
 */
export default function TagFilter({ coupons, selectedTags, onTagsChange, filterMode, onFilterModeChange }: TagFilterProps) {
  // 全タグを使用頻度順に集計
  const tagStats = useMemo(() => {
    const stats: Record<string, number> = {};

    coupons.forEach(coupon => {
      coupon.tags.forEach(tag => {
        stats[tag] = (stats[tag] || 0) + 1;
      });
    });

    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));
  }, [coupons]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearTags = () => {
    onTagsChange([]);
  };

  if (tagStats.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          タグでフィルタリング
        </h3>
        <div className="flex items-center gap-3">
          {selectedTags.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">絞り込みモード:</span>
                <button
                  onClick={() => onFilterModeChange(filterMode === 'AND' ? 'OR' : 'AND')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterMode === 'AND'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                  title={filterMode === 'AND' ? 'すべてのタグを含む' : 'いずれかのタグを含む'}
                >
                  {filterMode}
                </button>
              </div>
              <button
                onClick={clearTags}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                クリア
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tagStats.map(({ tag, count }) => {
          const isSelected = selectedTags.includes(tag);
          const baseColor = getTagColor(tag);

          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                transition-all cursor-pointer
                ${isSelected
                  ? 'ring-2 ring-blue-600 dark:ring-blue-400 ' + baseColor
                  : baseColor
                }
              `}
              aria-label={`タグ「${tag}」で${isSelected ? '解除' : 'フィルタリング'}`}
              aria-pressed={isSelected}
            >
              <span>{tag}</span>
              <span className="text-xs opacity-70">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            選択中のタグ: {' '}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {selectedTags.join(filterMode === 'AND' ? ' + ' : ' または ')}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
