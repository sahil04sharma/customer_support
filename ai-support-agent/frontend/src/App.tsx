import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import EmbedCode from './components/EmbedCode';
import ProtectedRoute from './components/ProtectedRoute';
import BusinessLogin from './pages/auth/BusinessLogin';
import BusinessRegister from './pages/auth/BusinessRegister';
import AgentDashboard from './pages/agent/AgentDashboard';
import Agents from './pages/dashboard/Agents';
import ConversationDetail from './pages/dashboard/ConversationDetail';
import Conversations from './pages/dashboard/Conversations';
import Documents from './pages/dashboard/Documents';
import Overview from './pages/dashboard/Overview';
import Settings from './pages/dashboard/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<BusinessLogin />} />
        <Route path="/register" element={<BusinessRegister />} />
        <Route path="/agent" element={<AgentDashboard />} />

        <Route element={<ProtectedRoute role="BUSINESS" />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="documents" element={<Documents />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="conversations/:id" element={<ConversationDetail />} />
            <Route path="agents" element={<Agents />} />
            <Route path="settings" element={<Settings />} />
            <Route path="embed" element={<EmbedCode />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
