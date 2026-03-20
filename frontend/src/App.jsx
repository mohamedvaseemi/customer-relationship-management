import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetails from './pages/ContactDetails';
import Users from './pages/Users';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Deals from './pages/Deals';
import Accounts from './pages/Accounts';
import Activities from './pages/Activities';
import Reports from './pages/Reports';
import Tickets from './pages/Tickets';
import Chat from './pages/Chat';
import Automation from './pages/Automation';
import FeatureComingSoon from './pages/FeatureComingSoon';
import Settings from './pages/Settings';
import ModulesAndFields from './pages/settings/ModulesAndFields';
import WorkflowRules from './pages/settings/WorkflowRules';
import RecycleBin from './pages/settings/RecycleBin';
import Appearance from './pages/settings/Appearance';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />

            <Route path="/contacts" element={<PrivateRoute><Layout><Contacts /></Layout></PrivateRoute>} />
            <Route path="/contacts/:id" element={<PrivateRoute><Layout><ContactDetails /></Layout></PrivateRoute>} />

            <Route path="/leads" element={<PrivateRoute><Layout><Leads /></Layout></PrivateRoute>} />
            <Route path="/leads/:id" element={<PrivateRoute><Layout><LeadDetails /></Layout></PrivateRoute>} />

            <Route path="/deals" element={<PrivateRoute><Layout><Deals /></Layout></PrivateRoute>} />
            <Route path="/accounts" element={<PrivateRoute><Layout><Accounts /></Layout></PrivateRoute>} />
            <Route path="/activities" element={<PrivateRoute><Layout><Activities /></Layout></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />

            <Route path="/tickets" element={<PrivateRoute><Layout><Tickets /></Layout></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Layout><Chat /></Layout></PrivateRoute>} />
            <Route path="/automation" element={<PrivateRoute><Layout><Automation /></Layout></PrivateRoute>} />

            <Route path="/users" element={<PrivateRoute><Layout><Users /></Layout></PrivateRoute>} />

            <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
            <Route path="/settings/modules" element={<PrivateRoute><Layout><ModulesAndFields /></Layout></PrivateRoute>} />
            <Route path="/settings/appearance" element={<PrivateRoute><Layout><Appearance /></Layout></PrivateRoute>} />
            <Route path="/settings/workflows" element={<PrivateRoute><Layout><WorkflowRules /></Layout></PrivateRoute>} />
            <Route path="/settings/recycle-bin" element={<PrivateRoute><Layout><RecycleBin /></Layout></PrivateRoute>} />

            {/* Feature Placeholders */}
            <Route path="/calls" element={<PrivateRoute><Layout><FeatureComingSoon title="Calls & Communication" /></Layout></PrivateRoute>} />
            <Route path="/campaigns" element={<PrivateRoute><Layout><FeatureComingSoon title="Marketing Campaigns" /></Layout></PrivateRoute>} />
            <Route path="/documents" element={<PrivateRoute><Layout><FeatureComingSoon title="Document Management" /></Layout></PrivateRoute>} />
            <Route path="/projects" element={<PrivateRoute><Layout><FeatureComingSoon title="Project Management" /></Layout></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
