import { useState } from 'react';
import InputForm from './components/InputForm';
import PlanBoard from './components/PlanBoard';
import { createPlan, updateTask } from './api';
import type { Plan, CreatePlanRequest } from './types';

function App() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlan = async (request: CreatePlanRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const newPlan = await createPlan(request);
      setPlan(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: number, done: boolean) => {
    if (!plan) return;
    
    try {
      await updateTask(plan.id, taskId, { done });
      
      setPlan(prevPlan => {
        if (!prevPlan) return null;
        
        const newTasksByDate = { ...prevPlan.tasks_by_date };
        Object.keys(newTasksByDate).forEach(date => {
          newTasksByDate[date] = newTasksByDate[date].map(task =>
            task.id === taskId ? { ...task, done } : task
          );
        });
        
        return { ...prevPlan, tasks_by_date: newTasksByDate };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクの更新に失敗しました');
    }
  };

  const handleRegenerate = () => {
    if (!plan) return;
    
    const request: CreatePlanRequest = {
      title: plan.title,
      description: plan.description,
      start_date: plan.start_date,
      due_date: plan.due_date,
      daily_hours: plan.daily_hours,
    };
    
    handleCreatePlan(request);
  };

  const handleShowJson = () => {
    if (plan) {
      alert(JSON.stringify(plan, null, 2));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          margin: '10px',
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          エラー: {error}
          <button 
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
      
      {plan ? (
        <PlanBoard
          plan={plan}
          onTaskToggle={handleTaskToggle}
          onRegenerate={handleRegenerate}
          onShowJson={handleShowJson}
        />
      ) : (
        <InputForm onSubmit={handleCreatePlan} loading={loading} />
      )}
    </div>
  );
}

export default App;
