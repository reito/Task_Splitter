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

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginTop: '5px',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#333'
  };

  return (
    <div className="input-form-container">
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>TaskSplitter</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="title" style={labelStyle}>タスク名 *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 管理画面の実装"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="description" style={labelStyle}>概要</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`以下の情報を含めると、より詳細なタスク分割ができます：

【技術スタック】使用する言語、フレームワーク、ライブラリ
例：Ruby on Rails 7.0, React 18, TypeScript, TailwindCSS

【機能詳細】実装する具体的な機能
例：ユーザー管理（CRUD）、権限管理（admin/user）、メール通知

【現状】現在の実装状況
例：基本的なモデルは作成済み、UIは未実装

【ゴール】完成時の状態
例：管理者がユーザー情報を一覧・編集でき、権限の変更が可能`}
            rows={8}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', fontSize: '13px' }}
          />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          <div>
            <label htmlFor="start_date" style={labelStyle}>開始日</label>
            <input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="due_date" style={labelStyle}>期限 *</label>
            <input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label htmlFor="daily_hours" style={labelStyle}>1日の作業時間 (時間)</label>
          <input
            id="daily_hours"
            type="number"
            min="1"
            max="12"
            value={dailyHours}
            onChange={(e) => setDailyHours(Number(e.target.value))}
            style={{ ...inputStyle, width: '150px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '15px 30px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '10px'
          }}
        >
          {loading ? '生成中...' : '生成する'}
        </button>
      </form>
    </div>
  );
}