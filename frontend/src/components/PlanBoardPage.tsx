import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PlanBoard from './PlanBoard';
import { updateTask } from '../api';
import type { Plan, CreatePlanRequest } from '../types';

export const PlanBoardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(location.state?.plan || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) {
      // プランが存在しない場合はトップページに戻る
      navigate('/');
    }
  }, [plan, navigate]);

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
    
    // 再生成は作成ページに戻って実行
    navigate('/create', { state: { initialData: request } });
  };

  const handleShowJson = () => {
    if (plan) {
      alert(JSON.stringify(plan, null, 2));
    }
  };

  if (!plan) {
    return null; // useEffectでリダイレクトされる
  }

  return (
    <div>
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
      
      <div style={{ 
        padding: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            ← プラン一覧へ戻る
          </button>

          <button
            onClick={() => navigate(`/plan/${plan.id}`)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            タスク詳細を見る →
          </button>
        </div>
        
        <PlanBoard
          plan={plan}
          onTaskToggle={handleTaskToggle}
          onRegenerate={handleRegenerate}
          onShowJson={handleShowJson}
        />
      </div>
    </div>
  );
};