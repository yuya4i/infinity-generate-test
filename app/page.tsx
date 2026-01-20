'use client';

import { useState, useMemo, useEffect } from 'react';
import CouponCard from '@/components/CouponCard';
import CategoryFilter from '@/components/CategoryFilter';
import AddCouponForm from '@/components/AddCouponForm';
import EditCouponForm from '@/components/EditCouponForm';
import SearchBar from '@/components/SearchBar';
import SortControl, { SortOption } from '@/components/SortControl';
import CouponStats from '@/components/CouponStats';
import Pagination from '@/components/Pagination';
import { useCoupons } from '@/hooks/useCoupons';
import { useTheme } from '@/hooks/useTheme';
import { CouponCategory, Coupon } from '@/types/coupon';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<CouponCategory | 'all' | 'favorites' | 'used'>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const { coupons, isLoading, addCoupon, duplicateCoupon, removeCoupon, updateCoupon, toggleFavorite, toggleUsed, clearExpiredCoupons, exportCoupons, importCoupons } = useCoupons();
  const { theme, toggleTheme } = useTheme();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importCoupons(file);
        alert('クーポンデータをインポートしました');
      } catch (error) {
        alert('インポートに失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
      }
      e.target.value = '';
    }
  };

  const filteredAndSortedCoupons = useMemo(() => {
    let filtered = coupons;

    if (selectedCategory === 'favorites') {
      filtered = filtered.filter(coupon => coupon.isFavorite);
    } else if (selectedCategory === 'used') {
      filtered = filtered.filter(coupon => coupon.isUsed);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(coupon => coupon.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(coupon =>
        coupon.title.toLowerCase().includes(query) ||
        coupon.description.toLowerCase().includes(query) ||
        coupon.source.toLowerCase().includes(query) ||
        coupon.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime();
        case 'oldest':
          return new Date(a.acquiredAt).getTime() - new Date(b.acquiredAt).getTime();
        case 'expiring-soon':
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        case 'expiring-last':
          return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [coupons, selectedCategory, searchQuery, sortBy]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const paginatedCoupons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedCoupons.slice(startIndex, endIndex);
  }, [filteredAndSortedCoupons, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedCoupons.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                クーポン一覧
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                お得なクーポンを見つけて、賢くお買い物（{coupons.length}件）
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleTheme}
                className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md transition-colors"
                title={`現在: ${theme === 'light' ? 'ライト' : theme === 'dark' ? 'ダーク' : 'システム'}モード`}
              >
                {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}
              </button>
              <button
                onClick={exportCoupons}
                className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md transition-colors"
              >
                エクスポート
              </button>
              <label className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md transition-colors cursor-pointer">
                インポート
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={clearExpiredCoupons}
                className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md transition-colors"
              >
                期限切れを削除
              </button>
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 4v16m8-8H4"></path>
                </svg>
                クーポン追加
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CouponStats coupons={coupons} />

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <SortControl
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onDelete={removeCoupon}
              onEdit={setEditingCoupon}
              onDuplicate={duplicateCoupon}
              onToggleFavorite={toggleFavorite}
              onToggleUsed={toggleUsed}
            />
          ))}
        </div>

        {filteredAndSortedCoupons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              {searchQuery
                ? '検索条件に一致するクーポンがありません'
                : 'このカテゴリのクーポンはありません'}
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAndSortedCoupons.length}
        />
      </main>

      {isAddFormOpen && (
        <AddCouponForm
          onAddCoupon={addCoupon}
          onClose={() => setIsAddFormOpen(false)}
        />
      )}

      {editingCoupon && (
        <EditCouponForm
          coupon={editingCoupon}
          onUpdateCoupon={updateCoupon}
          onClose={() => setEditingCoupon(null)}
        />
      )}
    </div>
  );
}
