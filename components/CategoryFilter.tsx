'use client';

import { CouponCategory } from '@/types/coupon';

interface CategoryFilterProps {
  selectedCategory: CouponCategory | 'all';
  onCategoryChange: (category: CouponCategory | 'all') => void;
}

const categories: { value: CouponCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'food', label: '飲食' },
  { value: 'shopping', label: 'ショッピング' },
  { value: 'travel', label: '旅行' },
  { value: 'entertainment', label: 'エンタメ' },
  { value: 'service', label: 'サービス' },
  { value: 'other', label: 'その他' },
];

/**
 * カテゴリフィルタコンポーネント
 */
export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.value
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
