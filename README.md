# Task Splitter 📋

## 概要

**Task Splitter** は、ソフトウェア開発プロジェクトの計画を AI によって自動的に具体的なタスクに分解し、効率的な開発スケジュールを作成するWebアプリケーションです。

### 🎯 主な機能

- **AI駆動タスク分解**: OpenAI GPT-4o-mini を使用して、プロジェクト概要から実装可能な具体的タスクに自動分解
- **スマートスケジューリング**: 指定した期間と1日の作業時間に基づいて最適なタスク配分
- **直感的なタスク管理**: カード形式のUIでタスクの表示・編集・削除・完了管理
- **プログレス追跡**: リアルタイムの進捗表示と完了率計算
- **期間柔軟性**: 短期（数日）から長期（数ヶ月）まで適切にタスク分散

## 🖥️ デモ

### プラン一覧画面
- 作成したプロジェクトプランを一覧表示
- 進捗率と完了タスク数をビジュアル表示
- プランの削除・詳細表示

### タスク詳細画面  
- プラン内の全タスクをカード形式で表示
- 完了タスクには取り消し線表示
- タスクの編集（タイトル・説明・所要時間）
- タスクの削除・完了切り替え

### AI タスク生成画面
- プロジェクトタイトル・概要・期間・作業時間を入力
- AI が技術的に実装可能なタスクに自動分解
- 15-60分の適切な粒度でタスク生成

## 🛠️ 技術スタック

### バックエンド
- **Ruby on Rails 7.2.2**: RESTful API サーバー
- **PostgreSQL 15**: データベース
- **OpenAI GPT-4o-mini**: AI タスク分解エンジン
- **Docker**: コンテナ化

### フロントエンド
- **React 19.1.1**: UI フレームワーク
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **React Router**: SPA ルーティング
- **Day.js**: 日付処理

### 開発・デプロイ
- **Docker Compose**: 開発環境統合
- **Yarn**: パッケージ管理
- **Bundle**: Ruby gem 管理

## 🚀 セットアップ手順

### 前提条件
- Docker & Docker Compose
- OpenAI API キー

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd Task_Splitter
```

### 2. 環境変数の設定
```bash
# .env ファイルを作成
echo 'OPENAI_API_KEY=your_openai_api_key_here' > .env
```

### 3. アプリケーションの起動
```bash
# 全サービスを起動
docker-compose up -d

# 初回のみ: データベース作成・マイグレーション
docker-compose exec backend rails db:create db:migrate
```

### 4. アクセス
- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:3000
- **データベース**: localhost:5432

## 📱 使用方法

### 基本的なワークフロー

1. **プラン作成**
   - トップページから「新規プラン作成」をクリック
   - プロジェクトの詳細を入力（タイトル、概要、期間、作業時間）
   - 「生成」ボタンで AI がタスクを自動分解

2. **タスク管理**
   - プラン一覧からプランを選択
   - 各タスクをチェックして完了管理
   - 必要に応じてタスクの編集・削除

3. **進捗確認**
   - 全体の進捗率をリアルタイム表示
   - 日別・タスク別の進捗確認

## 🔧 開発者向け情報

### プロジェクト構造
```
Task_Splitter/
├── backend/           # Rails API サーバー
│   ├── app/
│   │   ├── controllers/api/v1/  # API エンドポイント
│   │   ├── models/              # データモデル
│   │   └── services/            # AI 生成サービス
│   └── db/                      # データベース設定
├── frontend/          # React アプリケーション
│   ├── src/
│   │   ├── components/          # React コンポーネント
│   │   ├── types.ts            # TypeScript 型定義
│   │   └── api.ts              # API クライアント
└── docker-compose.yml # 開発環境設定
```

### API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/v1/plans` | プラン一覧取得 |
| POST | `/api/v1/plans` | プラン作成（AI生成含む） |
| GET | `/api/v1/plans/:id` | プラン詳細取得 |
| DELETE | `/api/v1/plans/:id` | プラン削除 |
| PATCH | `/api/v1/plans/:plan_id/tasks/:id` | タスク更新 |
| DELETE | `/api/v1/plans/:plan_id/tasks/:id` | タスク削除 |

### データベーススキーマ

#### Plans テーブル
- `title`: プロジェクトタイトル
- `description`: プロジェクト概要
- `start_date`, `due_date`: 開始日・期限
- `daily_hours`: 1日の作業時間
- `ai_model`, `raw_ai_json`: AI生成情報

#### PlanTasks テーブル
- `title`, `description`: タスク名・詳細
- `date`: 実行予定日
- `est_minutes`: 推定所要時間
- `done`: 完了フラグ
- `order_index`: 日内でのタスク順序

## 🔑 特徴的な技術実装

### AI タスク分解アルゴリズム
- **適応的プロンプト**: プロジェクト期間に応じてタスク密度を調整
- **技術特化**: ソフトウェア開発に特化した具体的タスク生成
- **依存関係考慮**: 調査→実装→テストの順序を保った分解
- **時間制約対応**: 1日の作業時間上限を超えないタスク配分

### パフォーマンス最適化
- **トークン効率化**: APIコスト削減のためプロンプトを最適化
- **レート制限対応**: 自動リトライ機能でAPIエラーを緩和
- **フォールバック機能**: API障害時の代替タスク生成

### レスポンシブデザイン
- **カード式レイアウト**: 美しく使いやすいタスク表示
- **プログレストラッキング**: 視覚的な進捗管理
- **モバイル対応**: 様々な画面サイズに対応

## 🧪 開発・テスト

### 開発サーバーの起動
```bash
# バックエンドのみ
docker-compose up backend

# フロントエンドのみ  
docker-compose up frontend

# 全体
docker-compose up
```

### ログの確認
```bash
# バックエンドログ
docker-compose logs backend

# フロントエンドログ
docker-compose logs frontend
```

### データベース操作
```bash
# Rails コンソール
docker-compose exec backend rails console

# データベースリセット
docker-compose exec backend rails db:reset
```

## 🤝 貢献

1. フォークしてブランチを作成
2. 機能を実装・テスト
3. プルリクエストを作成

## 📝 ライセンス

MIT License

## 🙋‍♂️ サポート

問題やご質問がございましたら、Issues でご報告ください。

---

**Task Splitter** - AI の力でプロジェクト管理を次のレベルへ 🚀