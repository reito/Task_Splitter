class Api::V1::PlansController < ApplicationController
  def index
    plans = Plan.order(created_at: :desc)
    render json: plans.map { |plan| format_plan_list_item(plan) }
  end

  def destroy
    plan = Plan.find(params[:id])
    plan.destroy
    render json: { message: "Plan deleted successfully" }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Plan not found" }, status: :not_found
  end

  def create
    plan_params_with_defaults = plan_params.merge(
      start_date: plan_params[:start_date] || Date.current,
      daily_hours: plan_params[:daily_hours] || 2,
      timezone: "Asia/Tokyo"
    )

    plan = Plan.new(plan_params_with_defaults)
    
    if plan.save
      result = AiPlanGenerator.call(plan)
      if result[:success]
        plan.update!(
          ai_model: result[:model], 
          raw_ai_json: result[:raw_response]
        )
        render json: format_plan_response(plan), status: :created
      else
        plan.destroy
        render json: { error: result[:error] }, status: :bad_gateway
      end
    else
      render json: { errors: plan.errors.full_messages }, status: :bad_request
    end
  end

  def show
    plan = Plan.find(params[:id])
    render json: format_plan_response(plan)
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Plan not found" }, status: :not_found
  end

  private

  def plan_params
    params.require(:plan).permit(:title, :description, :start_date, :due_date, :daily_hours)
  end

  def format_plan_list_item(plan)
    task_count = plan.plan_tasks.count
    completed_count = plan.plan_tasks.where(done: true).count
    
    {
      id: plan.id,
      title: plan.title,
      description: plan.description,
      start_date: plan.start_date,
      due_date: plan.due_date,
      task_count: task_count,
      completed_count: completed_count,
      progress: task_count > 0 ? (completed_count.to_f / task_count * 100).round : 0,
      created_at: plan.created_at
    }
  end

  def format_plan_response(plan)
    tasks_by_date = plan.plan_tasks.includes(:plan).group_by(&:date).transform_values do |tasks|
      tasks.sort_by(&:order_index).map do |task|
        {
          id: task.id,
          title: task.title,
          description: task.description,
          est_minutes: task.est_minutes,
          done: task.done,
          order_index: task.order_index
        }
      end
    end

    {
      id: plan.id,
      title: plan.title,
      description: plan.description,
      start_date: plan.start_date,
      due_date: plan.due_date,
      daily_hours: plan.daily_hours,
      tasks_by_date: tasks_by_date
    }
  end
end
