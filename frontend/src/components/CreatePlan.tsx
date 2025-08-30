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
      
      <InputForm onSubmit={handleCreatePlan} loading={loading} />
    </div>
  );
};