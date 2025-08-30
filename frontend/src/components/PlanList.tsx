import React, { useState, useEffect } from 'react';
import { Plan } from '../types';

interface PlanListProps {
  onSelectPlan: (plan: Plan) => void;
  onCreateNew: () => void;
}

export const PlanList: React.FC<PlanListProps> = ({ onSelectPlan, onCreateNew }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/plans');
      
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('このプランを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/plans/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }

      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      alert('削除に失敗しました: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        エラー: {error}
        <button 
          onClick={fetchPlans}
          className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">プラン一覧</h1>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          新規プラン作成
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">プランがありません</p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            最初のプランを作成
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
                <button
                  onClick={(e) => deletePlan(plan.id, e)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="削除"
                >
                  🗑️
                </button>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                <span>{plan.start_date} 〜 {plan.due_date}</span>
                <span>{plan.task_count}個のタスク</span>
              </div>

              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {plan.completed_count}/{plan.task_count} ({plan.progress}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};