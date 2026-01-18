# Infinity Generate - クーポン一覧アプリ

Web上やアプリ上で取得可能なクーポンを集約し、一覧化して閲覧・利用できるアプリケーションです。

## 概要

本アプリは、ユーザーが見落としがちなクーポンを集約し、カテゴリ別に整理して表示することで、購買意欲の向上を目的としています。

### 主な機能

- クーポン一覧表示（カード形式）
- カテゴリ別フィルタリング（飲食、ショッピング、旅行、エンタメ、サービス、その他）
- クーポン詳細表示
- 外部サイトへの遷移

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **パッケージマネージャー**: npm

## プロジェクト構成

```
├── app/                    # Next.js App Router
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # トップページ
│   └── globals.css         # グローバルスタイル
├── components/             # Reactコンポーネント
│   ├── CouponCard.tsx      # クーポンカード
│   └── CategoryFilter.tsx  # カテゴリフィルタ
├── types/                  # TypeScript型定義
│   └── coupon.ts           # クーポン型
├── lib/                    # ユーティリティ
│   └── dummyData.ts        # ダミーデータ
└── public/                 # 静的ファイル
```

## 開発環境のセットアップ

### 必要要件

- Node.js 18以降
- npm

### インストール

```bash
# リポジトリのクローン
git clone git@github:yuya4i/infinity-generate-test.git
cd infinity-generate-test

# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

### ビルド

```bash
npm run build
```

### 本番環境での起動

```bash
npm start
```

## テスト

agent-browserを使用したE2Eテストを実行できます。

```bash
# agent-browserでテスト
agent-browser open http://localhost:3001
agent-browser snapshot -i
```

## 開発フェーズ

### フェーズ0: スキャフォールド（完了）
- Next.jsアプリケーションの基本構成
- ダミーデータでのクーポン一覧表示
- カテゴリフィルタ機能

### フェーズ1: Webクーポン取り込み（予定）
- クーポン取得元の抽象化
- 実際のWebサイトからのクーポン取得実装
- データ保存機能

### フェーズ2: TODO管理（予定）
- 対象サービスの調査と優先度付け

### フェーズ3: アプリ連携（将来）
- アプリ内ログイン型クーポンの対応

## ライセンス

MIT
