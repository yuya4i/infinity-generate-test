import { Coupon } from '@/types/coupon';

interface CouponCardProps {
  coupon: Coupon;
}

/**
 * クーポンカードコンポーネント
 */
export default function CouponCard({ coupon }: CouponCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = new Date(coupon.expiresAt) < new Date();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            {coupon.title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {coupon.source}
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
          {coupon.category}
        </span>
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
    </div>
  );
}
