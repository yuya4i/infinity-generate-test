'use client';

import { Coupon } from '@/types/coupon';
import { useMemo } from 'react';

interface CouponStatsProps {
  coupons: Coupon[];
}

/**
 * クーポン統計情報コンポーネント
 */
export default function CouponStats({ coupons }: CouponStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const total = coupons.length;
    const expired = coupons.filter(c => new Date(c.expiresAt) < now).length;
    const expiringSoon = coupons.filter(c => {
      const expiresAt = new Date(c.expiresAt);
      return expiresAt >= now && expiresAt <= sevenDaysLater;
    }).length;

    const byCategory = coupons.reduce((acc, coupon) => {
      acc[coupon.category] = (acc[coupon.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active: total - expired,
      expired,
      expiringSoon,
      byCategory,
    };
  }, [coupons]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              総クーポン数
            </p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              有効なクーポン
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {stats.active}
            </p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              7日以内に期限切れ
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
              {stats.expiringSoon}
            </p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
            <svg
              className="w-6 h-6 text-orange-600 dark:text-orange-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              期限切れ
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {stats.expired}
            </p>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
