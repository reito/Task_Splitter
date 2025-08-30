Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  get "health" => "rails/health#show"

  namespace :api do
    namespace :v1 do
      resources :plans, only: [:index, :create, :show, :destroy] do
        resources :plan_tasks, only: [:update, :destroy], path: 'tasks'
      end
    end
  end
end
