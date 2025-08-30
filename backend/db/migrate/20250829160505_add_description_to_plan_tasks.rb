class AddDescriptionToPlanTasks < ActiveRecord::Migration[7.2]
  def change
    add_column :plan_tasks, :description, :text
  end
end
