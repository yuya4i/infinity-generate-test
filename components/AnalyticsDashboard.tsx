'use client';

import { Coupon } from '@/types/coupon';
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Chart.jsの必要なコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsDashboardProps {
  coupons: Coupon[];
}

/**
 * 統計・分析ダッシュボードコンポーネント
 * クーポンの使用状況を詳細に分析・可視化
 */
export default function AnalyticsDashboard({ coupons }: AnalyticsDashboardProps) {
  // 月別の節約額データを集計
  const monthlySavingsData = useMemo(() => {
    const monthlyData: Record<string, number> = {};

    // 過去6ヶ月分のデータを初期化
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }

    // 使用済みクーポンの節約額を月別に集計
    coupons.filter(c => c.isUsed).forEach(coupon => {
      const usedDate = coupon.usedAt ? new Date(coupon.usedAt) : new Date(coupon.acquiredAt);
      const key = `${usedDate.getFullYear()}-${String(usedDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.hasOwnProperty(key)) {
        monthlyData[key] += coupon.savedAmount || 0;
      }
    });

    const labels = Object.keys(monthlyData).map(key => {
      const [year, month] = key.split('-');
      return `${month}月`;
    });

    const data = Object.values(monthlyData);

    return { labels, data };
  }, [coupons]);

  // カテゴリ別の使用状況データ
  const categoryUsageData = useMemo(() => {
    const categoryData: Record<string, { total: number; used: number }> = {};

    coupons.forEach(coupon => {
      if (!categoryData[coupon.category]) {
        categoryData[coupon.category] = { total: 0, used: 0 };
      }
      categoryData[coupon.category].total++;
      if (coupon.isUsed) {
        categoryData[coupon.category].used++;
      }
    });

    const labels = Object.keys(categoryData);
    const data = labels.map(cat => categoryData[cat].used);

    return { labels, data, categoryData };
  }, [coupons]);

  // 取得元ランキング（TOP5）
  const sourceRanking = useMemo(() => {
    const sourceCount: Record<string, number> = {};

    coupons.forEach(coupon => {
      sourceCount[coupon.source] = (sourceCount[coupon.source] || 0) + 1;
    });

    const sorted = Object.entries(sourceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return sorted;
  }, [coupons]);

  // 平均クーポン価値と使用率
  const analytics = useMemo(() => {
    const totalCoupons = coupons.length;
    const usedCoupons = coupons.filter(c => c.isUsed).length;
    const totalSavings = coupons.reduce((sum, c) => sum + (c.savedAmount || 0), 0);
    const actualSavings = coupons.filter(c => c.isUsed).reduce((sum, c) => sum + (c.savedAmount || 0), 0);
    const averageCouponValue = totalCoupons > 0 ? totalSavings / totalCoupons : 0;
    const usageRate = totalCoupons > 0 ? (usedCoupons / totalCoupons) * 100 : 0;

    const now = new Date();
    const expired = coupons.filter(c => new Date(c.expiresAt) < now).length;
    const active = totalCoupons - expired;

    return {
      totalCoupons,
      usedCoupons,
      totalSavings,
      actualSavings,
      averageCouponValue,
      usageRate,
      expired,
      active,
    };
  }, [coupons]);

  // グラフのオプション
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '月別節約額推移（過去6ヶ月）',
        color: '#71717a',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '¥' + value.toLocaleString();
          },
          color: '#71717a',
        },
        grid: {
          color: 'rgba(113, 113, 122, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#71717a',
        },
        grid: {
          color: 'rgba(113, 113, 122, 0.1)',
        },
      },
    },
  };

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#71717a',
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: true,
        text: 'カテゴリ別使用済みクーポン数',
        color: '#71717a',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
  };

  const lineChartData = {
    labels: monthlySavingsData.labels,
    datasets: [
      {
        label: '節約額',
        data: monthlySavingsData.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: categoryUsageData.labels.map(cat => {
      const labelMap: Record<string, string> = {
        food: '飲食',
        shopping: 'ショッピング',
        travel: '旅行',
        entertainment: 'エンタメ',
        service: 'サービス',
        other: 'その他',
      };
      return labelMap[cat] || cat;
    }),
    datasets: [
      {
        data: categoryUsageData.data,
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(107, 114, 128, 0.7)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(107, 114, 128)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                クーポン使用率
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {analytics.usageRate.toFixed(1)}%
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                {analytics.usedCoupons} / {analytics.totalCoupons} 件
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
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                実際の節約額
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                ¥{analytics.actualSavings.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                使用済みクーポンから
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
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                平均クーポン価値
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                ¥{Math.round(analytics.averageCouponValue).toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                1クーポンあたり
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-300"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                有効活用度
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {analytics.active > 0
                  ? ((analytics.usedCoupons / (analytics.usedCoupons + analytics.active)) * 100).toFixed(1)
                  : '0.0'}%
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                期限切れを除く使用率
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
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* グラフセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 月別節約額推移 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* カテゴリ別使用状況 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="h-64">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* 取得元ランキング */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          クーポン取得元 TOP5
        </h3>
        <div className="space-y-3">
          {sourceRanking.map(([source, count], index) => (
            <div key={source} className="flex items-center gap-4">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}
              `}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {source}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {count}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  件
                </p>
              </div>
            </div>
          ))}
          {sourceRanking.length === 0 && (
            <p className="text-center text-zinc-500 dark:text-zinc-500 py-4">
              データがありません
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
