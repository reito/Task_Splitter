import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plan, PlanTask, UpdateTaskRequest } from '../types';

interface TaskEditForm {
  id: number;
  title: string;
  description: string;
  est_minutes: number;
}

export const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const planId = parseInt(id || '0');
  
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskEditForm | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/plans/${planId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch plan');
      }
      
      const data = await response.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: number, updates: UpdateTaskRequest) => {
    try {
      setSaving(true);
      const response = await fetch(`http://localhost:3000/api/v1/plans/${planId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // プラン情報を再取得
      await fetchPlan();
    } catch (err) {
      alert('更新に失敗しました: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('このタスクを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/plans/${planId}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // プラン情報を再取得
      await fetchPlan();
    } catch (err) {
      alert('削除に失敗しました: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const toggleTaskDone = async (task: PlanTask) => {
    await updateTask(task.id, { done: !task.done });
  };

  const startEditTask = (task: PlanTask) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description || '',
      est_minutes: task.est_minutes || 30,
    });
  };

  const saveTaskEdit = async () => {
    if (!editingTask) return;

    await updateTask(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      est_minutes: editingTask.est_minutes,
    });

    setEditingTask(null);
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="text-red-500 text-center py-8">
        エラー: {error || 'プランが見つかりません'}
        <button 
          onClick={() => navigate('/')}
          className="ml-4 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          戻る
        </button>
      </div>
    );
  }

  const allTasks = Object.entries(plan.tasks_by_date).flatMap(([date, tasks]) =>
    tasks.map(task => ({ ...task, date }))
  ).sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare !== 0 ? dateCompare : a.order_index - b.order_index;
  });

  const completedTasks = allTasks.filter(t => t.done).length;
  const progress = allTasks.length > 0 ? (completedTasks / allTasks.length * 100).toFixed(1) : 0;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa', 
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            background: 'none',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            color: '#6c757d',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.borderColor = '#adb5bd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#dee2e6';
          }}
        >
          ← プラン一覧に戻る
        </button>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef',
          marginBottom: '30px'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#333', 
            margin: '0 0 12px 0' 
          }}>
            {plan.title}
          </h1>
          <p style={{ 
            color: '#6c757d', 
            marginBottom: '20px',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            {plan.description}
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            fontSize: '14px', 
            color: '#6c757d', 
            marginBottom: '20px' 
          }}>
            <span>{plan.start_date} 〜 {plan.due_date}</span>
            <span>1日{plan.daily_hours}時間</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              backgroundColor: '#e9ecef',
              borderRadius: '10px',
              height: '10px',
              marginRight: '16px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  backgroundColor: '#28a745',
                  height: '100%',
                  borderRadius: '10px',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#495057',
              minWidth: '120px',
              textAlign: 'right' as const
            }}>
              {completedTasks}/{allTasks.length} ({progress}%)
            </span>
          </div>
        </div>

        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#333', 
          marginBottom: '20px' 
        }}>
          タスク一覧
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '16px'
        }}>
          {allTasks.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                opacity: task.done ? 0.8 : 1,
                transition: 'all 0.2s'
              }}
            >
              {editingTask?.id === task.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="タスク名"
                  />
                  
                  <textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical' as const,
                      minHeight: '80px'
                    }}
                    placeholder="詳細説明"
                  />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={editingTask.est_minutes}
                      onChange={(e) => setEditingTask({...editingTask, est_minutes: parseInt(e.target.value)})}
                      style={{
                        width: '80px',
                        padding: '8px 12px',
                        border: '1px solid #ced4da',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      min="15"
                      max="480"
                    />
                    <span style={{ fontSize: '14px', color: '#6c757d' }}>分</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={saveTaskEdit}
                      disabled={saving}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        opacity: saving ? 0.6 : 1
                      }}
                    >
                      {saving ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTaskDone(task)}
                        style={{
                          width: '18px',
                          height: '18px',
                          marginTop: '2px',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '500',
                          color: task.done ? '#6c757d' : '#333',
                          textDecoration: task.done ? 'line-through' : 'none',
                          margin: '0 0 4px 0'
                        }}>
                          {task.title}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: task.done ? '#adb5bd' : '#6c757d',
                          textDecoration: task.done ? 'line-through' : 'none',
                          margin: 0,
                          lineHeight: '1.4'
                        }}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', color: '#6c757d' }}>{task.est_minutes}分</span>
                      <span style={{ fontSize: '11px', color: '#adb5bd' }}>{task.date}</span>
                      <button
                        onClick={() => startEditTask(task)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          color: '#007bff'
                        }}
                        title="編集"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          color: '#dc3545'
                        }}
                        title="削除"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};