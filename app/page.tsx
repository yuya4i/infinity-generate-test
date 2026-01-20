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
import Toast from '@/components/Toast';
import { useCoupons } from '@/hooks/useCoupons';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { CouponCategory, Coupon } from '@/types/coupon';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<CouponCategory | 'all' | 'favorites' | 'used'>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [isImporting, setIsImporting] = useState(false);
  const { coupons, isLoading, addCoupon, duplicateCoupon, removeCoupon, updateCoupon, toggleFavorite, toggleUsed, clearExpiredCoupons, exportCoupons, importCoupons } = useCoupons();
  const { theme, toggleTheme } = useTheme();
  const { toasts, hideToast, success, error } = useToast();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      try {
        await importCoupons(file);
        success('クーポンデータをインポートしました');
      } catch (err) {
        error('インポートに失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'));
      } finally {
        setIsImporting(false);
      }
      e.target.value = '';
    }
  };

  const handleExport = () => {
    try {
      exportCoupons();
      success('クーポンデータをエクスポートしました');
    } catch (err) {
      error('エクスポートに失敗しました');
    }
  };

  const handleClearExpired = () => {
    if (window.confirm('期限切れのクーポンをすべて削除しますか？')) {
      try {
        clearExpiredCoupons();
        success('期限切れのクーポンを削除しました');
      } catch (err) {
        error('削除に失敗しました');
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このクーポンを削除しますか？')) {
      try {
        removeCoupon(id);
        success('クーポンを削除しました');
      } catch (err) {
        error('削除に失敗しました');
      }
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow Escape to work in forms
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      switch (e.key) {
        case 'n':
        case 'a':
          // Open add coupon form
          setIsAddFormOpen(true);
          e.preventDefault();
          break;
        case '/':
          // Focus search
          const searchInput = document.querySelector('input[type="text"][placeholder*="検索"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            e.preventDefault();
          }
          break;
        case 'Escape':
          // Close modals
          if (isAddFormOpen) {
            setIsAddFormOpen(false);
          } else if (editingCoupon) {
            setEditingCoupon(null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddFormOpen, editingCoupon]);

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
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                キーボードショートカット: <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-xs">N</kbd> 追加 /
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-xs">/</kbd> 検索 /
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-xs">ESC</kbd> 閉じる
              </p>
            </div>
            <nav aria-label="主要操作" className="flex flex-wrap gap-3">
              <button
                onClick={toggleTheme}
                className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md transition-colors"
                title={`現在: ${theme === 'light' ? 'ライト' : theme === 'dark' ? 'ダーク' : 'システム'}モード`}
                aria-label={`テーマ切り替え（現在: ${theme === 'light' ? 'ライト' : theme === 'dark' ? 'ダーク' : 'システム'}モード）`}
              >
                {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md transition-colors"
                aria-label="クーポンデータをエクスポート"
              >
                エクスポート
              </button>
              <label className={`px-4 py-2 text-sm rounded-md transition-colors ${
                isImporting
                  ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600 cursor-wait'
                  : 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 cursor-pointer'
              }`}>
                {isImporting ? 'インポート中...' : 'インポート'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="sr-only"
                  aria-label="クーポンデータをインポート"
                  disabled={isImporting}
                />
              </label>
              <button
                onClick={handleClearExpired}
                className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md transition-colors"
                aria-label="期限切れのクーポンを削除"
              >
                期限切れを削除
              </button>
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
                aria-label="新しいクーポンを追加"
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
            </nav>
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

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="クーポン一覧"
        >
          {paginatedCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onDelete={handleDelete}
              onEdit={setEditingCoupon}
              onDuplicate={duplicateCoupon}
              onToggleFavorite={toggleFavorite}
              onToggleUsed={toggleUsed}
            />
          ))}
        </div>

        {filteredAndSortedCoupons.length === 0 && (
          <div className="text-center py-12" role="status" aria-live="polite">
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

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
}
