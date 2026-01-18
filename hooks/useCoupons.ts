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

  const clearExpiredCoupons = () => {
    const now = new Date();
    setCoupons(prev => prev.filter(coupon => new Date(coupon.expiresAt) > now));
  };

  return {
    coupons,
    isLoading,
    addCoupon,
    removeCoupon,
    clearExpiredCoupons,
  };
}
