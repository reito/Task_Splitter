import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputForm from './InputForm';
import { createPlan } from '../api';
import type { CreatePlanRequest } from '../types';

export const CreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlan = async (request: CreatePlanRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const newPlan = await createPlan(request);
      // プラン作成成功後、プランIDをURLパラメータに付けてboardページに遷移
      navigate('/board', { state: { plan: newPlan } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa', 
      padding: '20px' 
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto' 
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            marginBottom: '20px',
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

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            marginBottom: '20px',
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
        
        <InputForm onSubmit={handleCreatePlan} loading={loading} />
      </div>
    </div>
  );
};