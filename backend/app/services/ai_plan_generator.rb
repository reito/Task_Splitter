class AiPlanGenerator
  def self.call(plan)
    new(plan).call
  end

  def initialize(plan)
    @plan = plan
  end

  def call
    Rails.logger.info "OpenAI API Key present: #{ENV['OPENAI_API_KEY'].present?}"
    Rails.logger.info "OpenAI API Key length: #{ENV['OPENAI_API_KEY']&.length || 0}"
    
    if ENV['OPENAI_API_KEY'].blank?
      Rails.logger.info "Using fallback due to missing API key"
      return fallback_plan
    end

    begin
      Rails.logger.info "Attempting OpenAI API call"
      @client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])
      response = @client.chat(
        parameters: {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system_prompt },
            { role: "user", content: user_prompt }
          ],
          response_format: { type: "json_object" }
        }
      )

      json_response = JSON.parse(response.dig("choices", 0, "message", "content"))
      plan_data = json_response["plan"]
      
      save_plan_tasks(plan_data)
      
      {
        success: true,
        model: "gpt-4o-mini",
        raw_response: json_response
      }
    rescue Faraday::TooManyRequestsError => e
      Rails.logger.error "Rate limit error: #{e.message}"
      Rails.logger.error "Response body: #{e.response[:body]}" if e.response
      # 30秒待機してリトライ
      sleep(30)
      retry if (@retry_count ||= 0) < 1 && (@retry_count += 1)
      fallback_plan
    rescue => e
      Rails.logger.error "AI Plan Generation failed: #{e.message}"
      Rails.logger.error "Full error: #{e.inspect}"
      fallback_plan
    end
  end

  private

  def system_prompt
    "ソフトウェアエンジニア向けタスク分解専門家。実装可能な具体的作業に分割。JSONスキーマ厳守。15-60分単位。"
  end

  def user_prompt
    <<~PROMPT
      タイトル: #{@plan.title}
      概要: #{@plan.description}
      開始日: #{@plan.start_date}〜期限: #{@plan.due_date} (#{(@plan.due_date - @plan.start_date).to_i + 1}日間)
      1日作業時間: #{@plan.daily_hours}時間

      JSON形式で出力:
      {"plan":{"days":[{"date":"YYYY-MM-DD","tasks":[{"title":"作業名","description":"具体内容","est_minutes":30}]}]}}

      制約: 
      - 必ず開始日から期限まで連続した全#{(@plan.due_date - @plan.start_date).to_i + 1}日分のdaysを作成
      - 各日のタスク15-60分単位、1日合計≤#{@plan.daily_hours * 60}分
      - エンジニアが実際に手を動かせる具体作業のみ
      - 例: "ユーザーモデル作成(30分)", "APIテスト実装(45分)"
      - titleは20文字以内、descriptionは技術詳細含む50-200文字
      - 機能実装は「調査→実装→テスト」の順で分割
      - 実装順序と依存関係を考慮
      - 作業量を全期間に適切に分散（短期間なら集中、長期間なら余裕を持って分散）
    PROMPT
  end

  def save_plan_tasks(plan_data)
    plan_data["days"].each do |day|
      date = Date.parse(day["date"])
      day["tasks"].each_with_index do |task, index|
        @plan.plan_tasks.create!(
          date: date,
          title: task["title"],
          description: task["description"],
          est_minutes: task["est_minutes"],
          order_index: index
        )
      end
    end
  end

  def fallback_plan
    days = (@plan.start_date..@plan.due_date).map(&:to_s)
    total_days = days.length
    daily_minutes = @plan.daily_hours * 60

    basic_tasks = generate_basic_tasks
    tasks_per_day = basic_tasks.length / total_days
    extra_tasks = basic_tasks.length % total_days

    days.each_with_index do |date, day_index|
      task_count = tasks_per_day + (day_index < extra_tasks ? 1 : 0)
      start_index = day_index * tasks_per_day + [day_index, extra_tasks].min
      
      day_tasks = basic_tasks.slice(start_index, task_count) || []
      
      day_tasks.each_with_index do |task_info, index|
        @plan.plan_tasks.create!(
          date: Date.parse(date),
          title: task_info[:title],
          description: task_info[:description],
          est_minutes: daily_minutes / day_tasks.length,
          order_index: index
        )
      end
    end

    {
      success: true,
      model: "fallback",
      raw_response: { fallback: true }
    }
  end

  def generate_basic_tasks
    keywords = extract_keywords(@plan.description || @plan.title)
    keywords.flat_map { |keyword| expand_keyword_to_tasks(keyword) }
  end

  def extract_keywords(text)
    common_keywords = ["設計", "実装", "テスト", "デプロイ"]
    text_keywords = text.downcase.scan(/\w+/).select { |w| w.length > 2 }
    (common_keywords + text_keywords).uniq.first(4)
  end

  def expand_keyword_to_tasks(keyword)
    case keyword
    when /設計|design/
      [
        { title: "要件定義と調査", description: "必要な機能の洗い出し、技術的な実現可能性の調査、既存コードベースの確認を行う" },
        { title: "設計書作成", description: "クラス図、シーケンス図、DB設計、APIインターフェース定義などの技術設計書を作成" },
        { title: "技術選定と環境構築", description: "使用するライブラリ/フレームワークの選定、開発環境のセットアップ、プロジェクト初期設定" }
      ]
    when /実装|開発|implementation/
      [
        { title: "データモデル作成", description: "必要なテーブル設計、ActiveRecord モデル作成、アソシエーション定義" },
        { title: "マイグレーション作成", description: "DB スキーマ定義、外部キー制約、インデックス設定、初期データ投入" },
        { title: "バリデーション実装", description: "モデルレベルのバリデーション、独自バリデータ作成、エラーメッセージ設定" },
        { title: "コントローラー作成", description: "CRUD アクション実装、パラメータ制御、レスポンス形式定義" },
        { title: "API エンドポイント実装", description: "ルーティング設定、JSON レスポンス、HTTP ステータスコード処理" },
        { title: "フロントエンド画面実装", description: "React コンポーネント作成、状態管理、フォームバリデーション" },
        { title: "API 連携実装", description: "fetch/axios 実装、エラーハンドリング、ローディング状態管理" }
      ]
    when /テスト|test/
      [
        { title: "単体テスト作成", description: "モデル、サービス、コントローラーのユニットテスト作成。カバレッジ80%以上を目標" },
        { title: "統合テスト作成", description: "E2Eテスト、APIテスト、画面遷移テストの作成。主要なユーザーフローをカバー" }
      ]
    when /デプロイ|deploy/
      [
        { title: "デプロイ環境準備", description: "本番環境の設定、環境変数の設定、CI/CDパイプラインの構築、Dockerイメージの作成" },
        { title: "本番デプロイと監視", description: "本番環境へのデプロイ実行、動作確認、ログ監視設定、アラート設定、パフォーマンス確認" }
      ]
    else
      [
        { title: "#{keyword}の調査", description: "#{keyword}に関する技術調査、実装方法の検討、ライブラリの選定、サンプルコードの確認" },
        { title: "#{keyword}の実装", description: "#{keyword}機能の実装、テストコード作成、ドキュメント作成、レビュー対応" }
      ]
    end
  end
end