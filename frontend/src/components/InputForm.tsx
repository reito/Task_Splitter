import { useState } from 'react';
import dayjs from 'dayjs';
import type { CreatePlanRequest } from '../types';

interface InputFormProps {
  onSubmit: (request: CreatePlanRequest) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState('');
  const [dailyHours, setDailyHours] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dueDate) {
      alert('タイトルと期限は必須です');
      return;
    }

    if (dayjs(dueDate).isBefore(dayjs(startDate))) {
      alert('期限は開始日より後に設定してください');
      return;
    }

    onSubmit({
      title,
      description: description || undefined,
      start_date: startDate,
      due_date: dueDate,
      daily_hours: dailyHours,
    });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>TaskSplitter</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="title">タスク名 *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 管理画面の実装"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label htmlFor="description">概要</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例: RailsでAdmin CRUD + 認可"
            rows={3}
            style={{ width: '100%', padding: '8px', marginTop: '5px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="start_date">開始日</label>
            <input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="due_date">期限 *</label>
            <input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="daily_hours">1日の作業時間 (時間)</label>
          <input
            id="daily_hours"
            type="number"
            min="1"
            max="12"
            value={dailyHours}
            onChange={(e) => setDailyHours(Number(e.target.value))}
            style={{ width: '100px', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '生成中...' : '生成する'}
        </button>
      </form>
    </div>
  );
}