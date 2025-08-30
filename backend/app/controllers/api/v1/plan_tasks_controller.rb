class Api::V1::PlanTasksController < ApplicationController
  def update
    plan = Plan.find(params[:plan_id])
    task = plan.plan_tasks.find(params[:id])
    
    if task.update(task_params)
      render json: {
        id: task.id,
        title: task.title,
        description: task.description,
        est_minutes: task.est_minutes,
        done: task.done,
        order_index: task.order_index,
        date: task.date
      }
    else
      render json: { errors: task.errors.full_messages }, status: :bad_request
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Task not found" }, status: :not_found
  end

  private

  def task_params
    params.require(:task).permit(:done)
  end
end
