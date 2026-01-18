# Claude Code 指示書（infinity-generate-test）

このドキュメントは **Claude Code** が本プロジェクトを実装するための正式な指示書です。
**Serena（MCP） / context7（MCP） / agent-browser（skills）** の使用を前提とします。

---

## 0. 前提 / リポジトリ

* 本プロジェクトのリポジトリ
  `git@github:yuya4i/infinity-generate-test.git`
* SSH config でホスト名 `github` が登録されていること
* 作業ディレクトリは任意（例: `~/workspace/infinity-generate-test`）

### リポジトリ取得

```bash
git clone git@github:yuya4i/infinity-generate-test.git
cd infinity-generate-test
```

---

## 1. 重要ルール（厳守）

### 1.1 finish-time.txt による自律作業

* `finish-time.txt` に作業終了時間が記載されている
* その時刻までは **ユーザー承認なしに継続的にコーディングしてよい**
* ただし以下は禁止

  * コンピュータを破壊するようなコマンド
  * OS / システム構築や恒久的な環境改変
  * 危険・破壊的な操作（例: 広範囲削除、ディスク操作、権限破壊）

#### finish-time.txt フォーマット

```text
YYYY-MM-DD HH:MM:SS
```

例:

```text
2026-01-01 23:00:00
```

---

### 1.2 git 運用ルール（最重要）

* **機能実装するたびに `git push`**
* **エラー修復するたびに `git push`**
* コミットは小さく、目的が明確な単位で行う

例:

```text
feat: add coupon list view
fix: handle empty coupon source response
test: add e2e scenario for coupon open
```

---

### 1.3 agent-browser によるテスト必須

* 機能実装のたびに **agent-browser でテストを実行**
* テスト合格後のみ次の機能に進行可能
* テスト失敗時は修復 → 再テスト → 合格 → push

---

## 2. MCP / Skills 使用要件（必須）

### 2.1 Serena（MCP）

* プロジェクト構造把握
* 実装計画・タスク分解
* 設計レビュー・影響範囲整理

### 2.2 context7（MCP）

* フレームワーク・ライブラリの正規利用方法確認
* API 仕様・ベストプラクティス調査
* スクレイピング・取得方式の妥当性確認

### 2.3 agent-browser（skills）

* E2E テスト実行
* 画面遷移・ユーザー動線確認
* クーポン一覧 → 外部遷移の検証

※ 各フェーズで **必ず MCP / Skills を使用すること**

---

## 3. プロダクト概要

本アプリは、ユーザーが **Web上 / アプリ上** で取得可能なクーポンを集約し、

* クーポンを一覧化して閲覧可能
* カテゴリ別（タブ / カード）に整理
* 対象アプリ・サイトへ遷移して利用可能

とすることで、見落としがちなクーポン利用を促進し、購買意欲の向上を目的とする。

### 3.1 仕様上の注意点

* Web クーポン: 比較的取得容易（例: AliExpress）
* アプリ / 会員限定クーポン: 取得困難

  * 例: 三井住友、じゃらん 等
* 初期は **Web クーポンのみ対応**
* アプリ連携は後続フェーズで TODO 化

---

## 4. 開発フェーズ方針

### フェーズ0: スキャフォールド

* アプリ起動可能
* ダミーデータでクーポン一覧表示
* agent-browser による起動確認テスト

### フェーズ1: Web クーポン取り込み（MVP）

* クーポン取得元を抽象化（`CouponSource`）
* 1〜2サイトからの取得実装
* 保存 → 一覧反映
* agent-browser による取得〜表示テスト

### フェーズ2: TODO.md 運用

* 対象サービス調査
* 優先度 / 難易度 / 取得方式を整理
* TODO.md に常時反映

### フェーズ3: アプリ内ログイン型（将来）

* サービス別に方式検討
* 段階導入

---

## 5. 必須成果物

* `finish-time.txt`
* `instructions.md`（本ファイル）
* `TODO.md`
* `README.md`
* テストコード（agent-browser）
* アプリ本体（MVP）

---

## 6. 実装要件（MVP）

### 6.1 クーポンデータモデル

* id
* source
* title
* description
* category
* expiresAt
* url
* acquiredAt
* tags

### 6.2 UI 要件

* クーポン一覧（カード形式）
* カテゴリフィルタ / タブ
* 詳細表示
* 外部遷移ボタン

### 6.3 取得要件

* Web クーポン 1ソース以上対応
* 手動取得で可
* エラー表示・ログ出力必須

---

## 7. テスト要件（agent-browser）

### 7.1 E2E シナリオ

* アプリ起動
* クーポン一覧表示
* カテゴリ切替
* 外部遷移確認

### 7.2 テスト運用

* 実装 → テスト → push
* 修復 → 再テスト → push

---

## 8. TODO.md 記載ルール

```md
# TODO

## P0
- [ ] (P0)(Easy)(Web) AliExpress クーポン取得

## P1
- [ ] (P1)(Med)(Web) じゃらん 調査

## P2
- [ ] (P2)(Hard)(App) 銀行アプリ連携
```

---

## 9. 実装手順

### Step A: Serena

* 構造把握
* MVP 設計

### Step B: context7

* 技術選定
* 取得方式検証

### Step C: agent-browser

* 実装
* テスト
* 合格後 push

---

## 10. コーディング規約

* 例外は必ずログ・表示
* 設定値は分離
* 破壊的操作禁止
* 依存追加は最小限

---

## 11. 完了条件（DoD）

* 起動・表示可能
* Web クーポン取得
* 分類・遷移可能
* agent-browser テスト合格
* push 運用遵守
* TODO.md 更新済み

---

## 12. 注意事項

* まず Web クーポンで価値提供
* 高難度機能は TODO 管理
* MCP / Skills 使用必須
* push 頻度厳守
