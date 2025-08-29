class CreatePlans < ActiveRecord::Migration[7.2]
  def change
    create_table :plans do |t|
      t.string :title
      t.text :description
      t.date :start_date
      t.date :due_date
      t.integer :daily_hours, default: 2
      t.string :timezone, default: "Asia/Tokyo"
      t.string :ai_model
      t.jsonb :raw_ai_json

      t.timestamps
    end
  end
end
