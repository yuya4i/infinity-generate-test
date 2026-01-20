'use client';

import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
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
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  ];

  return colors[Math.abs(hash) % colors.length];
}

/**
 * タグ入力コンポーネント
 * インラインでタグの追加・削除が可能
 */
export default function TagInput({ tags, onChange, placeholder = 'タグを入力（Enterで追加）' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();

      // 重複チェック
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }

      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // 入力が空の状態でBackspaceを押すと最後のタグを削除
      e.preventDefault();
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 min-h-[44px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium ${getTagColor(tag)}`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:opacity-70 transition-opacity"
              aria-label={`タグ「${tag}」を削除`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-zinc-900 dark:text-zinc-100"
        />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        Enterキーでタグを追加、×ボタンまたはBackspaceで削除
      </p>
    </div>
  );
}
