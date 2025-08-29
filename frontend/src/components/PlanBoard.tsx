import type { Plan, PlanTask } from '../types';
import dayjs from 'dayjs';

interface PlanBoardProps {
  plan: Plan;
  onTaskToggle: (taskId: number, done: boolean) => void;
  onRegenerate: () => void;
  onShowJson: () => void;
}

export default function PlanBoard({ plan, onTaskToggle, onRegenerate, onShowJson }: PlanBoardProps) {
  const allDates = Object.keys(plan.tasks_by_date).sort();
  const totalTasks = Object.values(plan.tasks_by_date).flat().length;
  const completedTasks = Object.values(plan.tasks_by_date).flat().filter(task => task.done).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format('M/D (ddd)');
  };

  const renderTask = (task: PlanTask) => (
    <li key={task.id} style={{ margin: '8px 0' }}>
      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={task.done}
          onChange={(e) => onTaskToggle(task.id, e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        <span style={{ textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1 }}>
          {task.title}
        </span>
        {task.est_minutes && (
          <span style={{ marginLeft: '8px', fontSize: '0.8em', color: '#666' }}>
            ({task.est_minutes}分)
          </span>
        )}
      </label>
    </li>
  );

  return (
    <div className="plan-board-container">
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{plan.title}</h2>
          {plan.description && <p style={{ color: '#666', margin: 0 }}>{plan.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onRegenerate}
            style={{
              padding: '10px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            再生成
          </button>
          <button
            onClick={onShowJson}
            style={{
              padding: '10px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            JSON表示
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>進捗: {completedTasks}/{totalTasks}</span>
          <span>{progressPercentage}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '20px',
          backgroundColor: '#e9ecef',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: '#28a745',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: allDates.length > 4 ? 'repeat(auto-fit, minmax(250px, 1fr))' : `repeat(${allDates.length}, 1fr)`,
        gap: '15px',
        overflowX: 'auto'
      }}>
        {allDates.map(date => (
          <div key={date} style={{
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            minWidth: '200px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', fontSize: '16px' }}>
              {formatDate(date)}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {plan.tasks_by_date[date]?.map(renderTask) || []}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}