class CreatePlanTasks < ActiveRecord::Migration[7.2]
  def change
    create_table :plan_tasks do |t|
      t.references :plan, null: false, foreign_key: true
      t.date :date
      t.string :title
      t.integer :est_minutes
      t.boolean :done, default: false
      t.integer :order_index

      t.timestamps
    end
  end
end
