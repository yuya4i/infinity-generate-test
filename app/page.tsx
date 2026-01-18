'use client';

import { useState } from 'react';
import CouponCard from '@/components/CouponCard';
import CategoryFilter from '@/components/CategoryFilter';
import { dummyCoupons } from '@/lib/dummyData';
import { CouponCategory } from '@/types/coupon';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<CouponCategory | 'all'>('all');

  const filteredCoupons = selectedCategory === 'all'
    ? dummyCoupons
    : dummyCoupons.filter(coupon => coupon.category === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            クーポン一覧
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            お得なクーポンを見つけて、賢くお買い物
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              このカテゴリのクーポンはありません
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
