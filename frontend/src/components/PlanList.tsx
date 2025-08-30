import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plan } from '../types';

export const PlanList: React.FC = () => {
  const navigate = useNavigate();
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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa', 
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center' as const,
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#333',
          marginBottom: '20px'
        }}>
          プラン一覧
        </h1>
        <button
          onClick={() => navigate('/create')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          新規プラン作成
        </button>
      </div>

      {plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#6c757d', marginBottom: '20px', fontSize: '16px' }}>
            プランがありません
          </p>
          <button
            onClick={() => navigate('/create')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            最初のプランを作成
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => navigate(`/plan/${plan.id}`)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                border: '1px solid #e9ecef',
                transition: 'all 0.2s',
                position: 'relative' as const
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#333', 
                  margin: '0',
                  flex: 1,
                  marginRight: '10px'
                }}>
                  {plan.title}
                </h3>
                <button
                  onClick={(e) => deletePlan(plan.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#dc3545',
                    borderRadius: '4px'
                  }}
                  title="削除"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  🗑️
                </button>
              </div>
              
              <p style={{ 
                color: '#6c757d', 
                marginBottom: '16px', 
                fontSize: '14px',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {plan.description}
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                fontSize: '12px', 
                color: '#6c757d', 
                marginBottom: '16px' 
              }}>
                <span>{plan.start_date} 〜 {plan.due_date}</span>
                <span>{plan.task_count}個のタスク</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  flex: 1,
                  backgroundColor: '#e9ecef',
                  borderRadius: '10px',
                  height: '8px',
                  marginRight: '12px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      backgroundColor: '#28a745',
                      height: '100%',
                      borderRadius: '10px',
                      width: `${plan.progress}%`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: '#495057',
                  minWidth: '80px',
                  textAlign: 'right' as const
                }}>
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