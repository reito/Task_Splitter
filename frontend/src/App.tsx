import { Routes, Route } from 'react-router-dom';
import { PlanList } from './components/PlanList';
import { PlanDetail } from './components/PlanDetail';
import { CreatePlan } from './components/CreatePlan';
import { PlanBoardPage } from './components/PlanBoardPage';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Routes>
        <Route path="/" element={<PlanList />} />
        <Route path="/create" element={<CreatePlan />} />
        <Route path="/plan/:id" element={<PlanDetail />} />
        <Route path="/board" element={<PlanBoardPage />} />
      </Routes>
    </div>
  );
}

export default App;
