/**
 * クーポンのカテゴリ
 */
export type CouponCategory =
  | 'food'          // 飲食
  | 'shopping'      // ショッピング
  | 'travel'        // 旅行
  | 'entertainment' // エンターテインメント
  | 'service'       // サービス
  | 'other';        // その他

/**
 * クーポンデータモデル
 */
export interface Coupon {
  /** クーポンID */
  id: string;

  /** 取得元（例: AliExpress, じゃらん） */
  source: string;

  /** クーポンタイトル */
  title: string;

  /** クーポン説明 */
  description: string;

  /** カテゴリ */
  category: CouponCategory;

  /** 有効期限 */
  expiresAt: Date;

  /** クーポン利用URL */
  url: string;

  /** 取得日時 */
  acquiredAt: Date;

  /** タグ */
  tags: string[];
}

/**
 * クーポン取得元を抽象化するインターフェース
 */
export interface CouponSource {
  /** 取得元名 */
  name: string;

  /** クーポン取得メソッド */
  fetchCoupons(): Promise<Coupon[]>;
}
