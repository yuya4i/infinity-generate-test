import { Coupon } from '@/types/coupon';

interface CouponCardProps {
  coupon: Coupon;
  onDelete?: (id: string) => void;
  onEdit?: (coupon: Coupon) => void;
  onDuplicate?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleUsed?: (id: string) => void;
}

/**
 * クーポンカードコンポーネント
 */
export default function CouponCard({ coupon, onDelete, onEdit, onDuplicate, onToggleFavorite, onToggleUsed }: CouponCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const now = new Date();
  const expiresAt = new Date(coupon.expiresAt);
  const isExpired = expiresAt < now;

  // 期限までの日数を計算
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpiringVeryEarly = daysUntilExpiry <= 3 && daysUntilExpiry > 0;

  return (
    <article
      className={`bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border relative ${
        isExpiringVeryEarly
          ? 'border-red-500 dark:border-red-400 border-2'
          : isExpiringSoon
          ? 'border-orange-500 dark:border-orange-400 border-2'
          : 'border-zinc-200 dark:border-zinc-800'
      }`}
      role="listitem"
      aria-label={`${coupon.title}のクーポン`}
    >
      <div className="absolute top-2 right-2 flex gap-1" role="group" aria-label="クーポン操作">
        {onEdit && (
          <button
            onClick={() => onEdit(coupon)}
            className="p-1 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="編集"
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
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
        )}
        {onDuplicate && (
          <button
            onClick={() => onDuplicate(coupon.id)}
            className="p-1 text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="複製"
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
              <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(coupon.id)}
            className="p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="削除"
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
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>
      <div className="flex justify-between items-start mb-3 pr-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            {coupon.title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {coupon.source}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
            {coupon.category}
          </span>
          {isExpiringVeryEarly && (
            <span className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse flex items-center gap-1">
              🔴 あと{daysUntilExpiry}日
            </span>
          )}
          {isExpiringSoon && !isExpiringVeryEarly && (
            <span className="px-3 py-1 text-xs font-medium bg-orange-500 text-white rounded-full flex items-center gap-1">
              ⚠️ あと{daysUntilExpiry}日
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4">
        {coupon.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {coupon.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <p className={`${isExpired ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
              有効期限: {formatDate(coupon.expiresAt)}
            </p>
          </div>
          <a
            href={coupon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            利用する
          </a>
        </div>

        {(onToggleFavorite || onToggleUsed) && (
          <div className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(coupon.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  coupon.isFavorite
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {coupon.isFavorite ? '★ お気に入り' : '☆ お気に入り'}
              </button>
            )}
            {onToggleUsed && (
              <button
                onClick={() => onToggleUsed(coupon.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  coupon.isUsed
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {coupon.isUsed ? '✓ 使用済み' : '使用済みにする'}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
