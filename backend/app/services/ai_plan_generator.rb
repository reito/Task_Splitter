class AiPlanGenerator
  def self.call(plan)
    new(plan).call
  end

  def initialize(plan)
    @plan = plan
  end

  def call
    return fallback_plan if ENV['OPENAI_API_KEY'].blank?

    begin
      @client = OpenAI::Client.new(api_key: ENV['OPENAI_API_KEY'])
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
    rescue => e
      Rails.logger.error "AI Plan Generation failed: #{e.message}"
      fallback_plan
    end
  end

  private

  def system_prompt
    <<~PROMPT
      あなたはタスク分解と日程割り当ての専門家です。出力は必ず指定のJSONスキーマに厳密準拠で返してください。タイムゾーンはAsia/Tokyo。開始日から期限までの範囲で、1日の作業上限時間（hours_per_day）を超えないように、小タスクを日付ごとに割り当てます。小タスクは実行可能な粒度にしてください。
    PROMPT
  end

  def user_prompt
    <<~PROMPT
      タイトル: #{@plan.title}
      概要: #{@plan.description}
      開始日: #{@plan.start_date}
      期限: #{@plan.due_date}
      1日作業時間: #{@plan.daily_hours} 時間
      出力スキーマ:
      {
        "plan": {
          "model": "string",
          "assumptions": "string", 
          "days": [
            {
              "date": "YYYY-MM-DD",
              "tasks": [
                {"title": "string", "est_minutes": number}
              ]
            }
          ]
        }
      }
      制約:
      - days は開始日〜期限の連続日付を使う
      - 各日の合計 est_minutes ≤ daily_hours*60
      - タスク名は行動ベース（例: "モデル定義とマイグレーション作成"）
      - 返答はJSONのみ（説明文なし）
    PROMPT
  end

  def save_plan_tasks(plan_data)
    plan_data["days"].each do |day|
      date = Date.parse(day["date"])
      day["tasks"].each_with_index do |task, index|
        @plan.plan_tasks.create!(
          date: date,
          title: task["title"],
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
      
      day_tasks.each_with_index do |task_title, index|
        @plan.plan_tasks.create!(
          date: Date.parse(date),
          title: task_title,
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
      ["要件整理", "設計書作成", "技術選定"]
    when /実装|開発|implementation/
      ["基本実装", "機能追加", "統合実装"]
    when /テスト|test/
      ["単体テスト", "結合テスト"]
    when /デプロイ|deploy/
      ["デプロイ準備", "本番反映"]
    else
      ["#{keyword}の準備", "#{keyword}の実装"]
    end
  end
end