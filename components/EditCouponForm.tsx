'use client';

import { useState } from 'react';
import { Coupon, CouponCategory } from '@/types/coupon';

interface EditCouponFormProps {
  coupon: Coupon;
  onUpdateCoupon: (id: string, updates: Partial<Omit<Coupon, 'id' | 'acquiredAt'>>) => void;
  onClose: () => void;
}

/**
 * クーポン編集フォームコンポーネント
 */
export default function EditCouponForm({ coupon, onUpdateCoupon, onClose }: EditCouponFormProps) {
  const [formData, setFormData] = useState({
    source: coupon.source,
    title: coupon.title,
    description: coupon.description,
    category: coupon.category,
    expiresAt: new Date(coupon.expiresAt).toISOString().split('T')[0],
    url: coupon.url,
    tags: coupon.tags.join(', '),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 必須フィールドの検証
    if (!formData.source.trim()) {
      newErrors.source = '取得元を入力してください';
    } else if (formData.source.trim().length < 2) {
      newErrors.source = '取得元は2文字以上で入力してください';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'タイトルは3文字以上で入力してください';
    }

    if (!formData.description.trim()) {
      newErrors.description = '説明を入力してください';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = '説明は10文字以上で入力してください';
    }

    if (!formData.expiresAt) {
      newErrors.expiresAt = '有効期限を入力してください';
    } else {
      const expiryDate = new Date(formData.expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        newErrors.expiresAt = '有効期限は今日以降の日付を指定してください';
      }
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URLを入力してください';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = '有効なURLを入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updates: Partial<Omit<Coupon, 'id' | 'acquiredAt'>> = {
      source: formData.source.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      expiresAt: new Date(formData.expiresAt),
      url: formData.url.trim(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    onUpdateCoupon(coupon.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              クーポンを編集
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                取得元 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
                  errors.source ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
                }`}
                placeholder="例: AliExpress"
              />
              {errors.source && (
                <p className="mt-1 text-sm text-red-500">{errors.source}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
                  errors.title ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
                }`}
                placeholder="例: 全商品10%オフクーポン"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                説明 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
                  errors.description ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
                }`}
                placeholder="例: 初回購入限定で全商品が10%オフになるクーポンです"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CouponCategory })}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="food">飲食</option>
                <option value="shopping">ショッピング</option>
                <option value="travel">旅行</option>
                <option value="entertainment">エンターテインメント</option>
                <option value="service">サービス</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                有効期限 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
                  errors.expiresAt ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
                }`}
              />
              {errors.expiresAt && (
                <p className="mt-1 text-sm text-red-500">{errors.expiresAt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
                  errors.url ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
                }`}
                placeholder="https://example.com/coupon"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-500">{errors.url}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                タグ（カンマ区切り）
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                placeholder="例: 初回限定, 全商品対象"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                更新
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium rounded-md transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
