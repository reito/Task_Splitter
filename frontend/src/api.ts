import type { Plan, CreatePlanRequest, UpdateTaskRequest } from './types';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export async function createPlan(request: CreatePlanRequest): Promise<Plan> {
  const response = await fetch(`${API_BASE_URL}/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ plan: request }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.errors?.join(', ') || 'Failed to create plan');
  }

  return response.json();
}

export async function getPlan(id: number): Promise<Plan> {
  const response = await fetch(`${API_BASE_URL}/plans/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get plan');
  }

  return response.json();
}

export async function updateTask(planId: number, taskId: number, request: UpdateTaskRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/plans/${planId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task: request }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.errors?.join(', ') || 'Failed to update task');
  }
}