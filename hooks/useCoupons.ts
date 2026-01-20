'use client';

import { useState, useEffect } from 'react';
import { Coupon } from '@/types/coupon';
import { dummyCoupons } from '@/lib/dummyData';

const STORAGE_KEY = 'infinity-generate-coupons';

/**
 * クーポンを管理するカスタムフック
 */
export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedCoupons = localStorage.getItem(STORAGE_KEY);
    if (storedCoupons) {
      try {
        const parsed = JSON.parse(storedCoupons);
        const withDates = parsed.map((coupon: Coupon) => ({
          ...coupon,
          expiresAt: new Date(coupon.expiresAt),
          acquiredAt: new Date(coupon.acquiredAt),
        }));
        setCoupons(withDates);
      } catch (error) {
        console.error('Failed to parse stored coupons:', error);
        setCoupons(dummyCoupons);
      }
    } else {
      setCoupons(dummyCoupons);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    }
  }, [coupons, isLoading]);

  const addCoupon = (couponData: Omit<Coupon, 'id' | 'acquiredAt'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: Date.now().toString(),
      acquiredAt: new Date(),
    };
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const removeCoupon = (id: string) => {
    setCoupons(prev => prev.filter(coupon => coupon.id !== id));
  };

  const updateCoupon = (id: string, updates: Partial<Omit<Coupon, 'id' | 'acquiredAt'>>) => {
    setCoupons(prev => prev.map(coupon =>
      coupon.id === id ? { ...coupon, ...updates } : coupon
    ));
  };

  const clearExpiredCoupons = () => {
    const now = new Date();
    setCoupons(prev => prev.filter(coupon => new Date(coupon.expiresAt) > now));
  };

  const exportCoupons = () => {
    const dataStr = JSON.stringify(coupons, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `coupons-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importCoupons = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content);

          if (!Array.isArray(imported)) {
            throw new Error('Invalid file format');
          }

          const withDates = imported.map((coupon: Coupon) => ({
            ...coupon,
            expiresAt: new Date(coupon.expiresAt),
            acquiredAt: new Date(coupon.acquiredAt),
          }));

          setCoupons(withDates);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  return {
    coupons,
    isLoading,
    addCoupon,
    removeCoupon,
    updateCoupon,
    clearExpiredCoupons,
    exportCoupons,
    importCoupons,
  };
}
