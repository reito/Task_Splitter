class PlanTask < ApplicationRecord
  belongs_to :plan

  validates :title, :date, presence: true
  validates :order_index, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :est_minutes, numericality: { greater_than: 0 }, allow_nil: true

  scope :for_date, ->(date) { where(date: date) }
  scope :ordered, -> { order(:order_index) }
end
