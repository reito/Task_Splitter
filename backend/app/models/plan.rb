class Plan < ApplicationRecord
  has_many :plan_tasks, dependent: :destroy

  validates :title, presence: true
  validates :start_date, :due_date, presence: true
  validates :daily_hours, inclusion: { in: 1..12 }
  validate :due_date_after_start_date

  private

  def due_date_after_start_date
    return unless start_date && due_date

    errors.add(:due_date, "must be after start date") if due_date < start_date
  end
end
