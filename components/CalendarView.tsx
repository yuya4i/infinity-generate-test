'use client';

import { Coupon } from '@/types/coupon';
import { useState, useMemo } from 'react';

interface CalendarViewProps {
  coupons: Coupon[];
  onCouponClick?: (coupon: Coupon) => void;
}

interface DayCoupons {
  date: Date;
  coupons: Coupon[];
  isCurrentMonth: boolean;
}

/**
 * カレンダービューコンポーネント
 * クーポンの期限日をカレンダー形式で表示
 */
export default function CalendarView({ coupons, onCouponClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 月の最初の日と最後の日を取得
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const lastDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  // カレンダーグリッドのデータを生成
  const calendarDays = useMemo(() => {
    const days: DayCoupons[] = [];

    // 月の最初の週の空白を埋める（日曜日始まり）
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(prevMonthLastDay);
      date.setDate(prevMonthLastDay.getDate() - i);
      days.push({
        date,
        coupons: [],
        isCurrentMonth: false,
      });
    }

    // 当月の日付
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayCoupons = coupons.filter(coupon => {
        const expiryDate = new Date(coupon.expiresAt);
        return expiryDate.getFullYear() === date.getFullYear() &&
               expiryDate.getMonth() === date.getMonth() &&
               expiryDate.getDate() === date.getDate();
      });

      days.push({
        date,
        coupons: dayCoupons,
        isCurrentMonth: true,
      });
    }

    // 残りの週を埋める
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
        days.push({
          date,
          coupons: [],
          isCurrentMonth: false,
        });
      }
    }

    return days;
  }, [currentDate, coupons, firstDayOfMonth, lastDayOfMonth]);

  // 選択された日付のクーポン
  const selectedDayCoupons = useMemo(() => {
    if (!selectedDate) return [];

    return coupons.filter(coupon => {
      const expiryDate = new Date(coupon.expiresAt);
      return expiryDate.getFullYear() === selectedDate.getFullYear() &&
             expiryDate.getMonth() === selectedDate.getMonth() &&
             expiryDate.getDate() === selectedDate.getDate();
    });
  }, [selectedDate, coupons]);

  // 月の変更
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 日付がクリックされたとき
  const handleDayClick = (day: DayCoupons) => {
    if (day.coupons.length > 0) {
      setSelectedDate(day.date);
    }
  };

  // 期限までの日数に基づいて色を決定
  const getDayColor = (coupons: Coupon[]) => {
    if (coupons.length === 0) return null;

    const now = new Date();
    let hasVeryUrgent = false;
    let hasUrgent = false;

    for (const coupon of coupons) {
      const daysUntilExpiry = Math.ceil((new Date(coupon.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 3 && daysUntilExpiry >= 0) {
        hasVeryUrgent = true;
        break;
      } else if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
        hasUrgent = true;
      }
    }

    if (hasVeryUrgent) return 'bg-red-500 dark:bg-red-600 text-white animate-pulse';
    if (hasUrgent) return 'bg-orange-500 dark:bg-orange-600 text-white';
    return 'bg-blue-500 dark:bg-blue-600 text-white';
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const today = new Date();
  const isToday = (date: Date) => {
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-800">
      {/* ヘッダー: 月ナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
          aria-label="前の月"
        >
          ←
        </button>

        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            今日
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
          aria-label="次の月"
        >
          →
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-600 dark:text-red-400' :
              index === 6 ? 'text-blue-600 dark:text-blue-400' :
              'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const dayColor = getDayColor(day.coupons);
          const isTodayDate = isToday(day.date);

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={day.coupons.length === 0}
              className={`
                relative min-h-[80px] p-2 rounded-md border transition-all
                ${!day.isCurrentMonth ? 'opacity-30' : ''}
                ${isTodayDate ? 'ring-2 ring-blue-600 dark:ring-blue-400' : ''}
                ${day.coupons.length > 0
                  ? 'cursor-pointer hover:shadow-lg'
                  : 'cursor-default'
                }
                ${day.coupons.length > 0
                  ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                }
              `}
              aria-label={`${day.date.getDate()}日 ${day.coupons.length}件のクーポン`}
            >
              <div className="text-left">
                <span className={`text-sm font-medium ${
                  day.isCurrentMonth
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}>
                  {day.date.getDate()}
                </span>
              </div>

              {/* クーポン数のバッジ */}
              {day.coupons.length > 0 && (
                <div className="mt-1">
                  <span className={`
                    inline-block px-2 py-1 text-xs font-bold rounded-full
                    ${dayColor}
                  `}>
                    {day.coupons.length}件
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 選択された日のクーポン詳細 */}
      {selectedDate && selectedDayCoupons.length > 0 && (
        <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日のクーポン
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              閉じる
            </button>
          </div>

          <div className="space-y-2">
            {selectedDayCoupons.map(coupon => {
              const now = new Date();
              const daysUntilExpiry = Math.ceil((new Date(coupon.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isVeryUrgent = daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
              const isUrgent = daysUntilExpiry <= 7 && daysUntilExpiry >= 0;

              return (
                <button
                  key={coupon.id}
                  onClick={() => onCouponClick?.(coupon)}
                  className={`
                    w-full text-left p-3 rounded-md border transition-all
                    hover:shadow-md
                    ${isVeryUrgent
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                      : isUrgent
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {coupon.title}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {coupon.source}
                      </p>
                    </div>
                    {isVeryUrgent && (
                      <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full whitespace-nowrap animate-pulse">
                        🔴 あと{daysUntilExpiry}日
                      </span>
                    )}
                    {isUrgent && !isVeryUrgent && (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-500 text-white rounded-full whitespace-nowrap">
                        ⚠️ あと{daysUntilExpiry}日
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 凡例 */}
      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          色の凡例
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded animate-pulse"></div>
            <span>3日以内に期限切れ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>7日以内に期限切れ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>その他のクーポン</span>
          </div>
        </div>
      </div>
    </div>
  );
}
