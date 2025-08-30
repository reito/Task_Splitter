export interface Plan {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  due_date: string;
  daily_hours: number;
  tasks_by_date: Record<string, PlanTask[]>;
  // プラン一覧用の追加フィールド
  task_count?: number;
  completed_count?: number;
  progress?: number;
  created_at?: string;
}

export interface PlanTask {
  id: number;
  title: string;
  description?: string;
  est_minutes?: number;
  done: boolean;
  order_index: number;
}

export interface CreatePlanRequest {
  title: string;
  description?: string;
  start_date?: string;
  due_date: string;
  daily_hours?: number;
}

export interface UpdateTaskRequest {
  done?: boolean;
  title?: string;
  description?: string;
  est_minutes?: number;
}