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
import GettingStarted from './pages/dashboard/GettingStarted';
import Overview from './pages/dashboard/Overview';
import Settings from './pages/dashboard/Settings';
import TestAssistant from './pages/dashboard/TestAssistant';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminOverview from './pages/admin/AdminOverview';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminBusinessDetail from './pages/admin/AdminBusinessDetail';
import AdminUsage from './pages/admin/AdminUsage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<BusinessLogin />} />
        <Route path="/register" element={<BusinessRegister />} />
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="businesses/:id" element={<AdminBusinessDetail />} />
            <Route path="usage" element={<AdminUsage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="BUSINESS" />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="getting-started" element={<GettingStarted />} />
            <Route path="test" element={<TestAssistant />} />
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
