import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StatsProvider } from './contexts/StatsContext';

// Layout public
import PublicLayout from './components/public/PublicLayout';

// Pages publiques
import DeposerDoleance from './public/DeposerDoleance';
import SuiviDoleance from './public/SuiviDoleance';
import ToutesDoleances from './public/ToutesDoleances';
import AppelerAgent from './public/AppelerAgent';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Back-office
import BackofficeLayout from './backoffice/BackofficeLayout';
import Dashboard from './backoffice/Dashboard';
import Doleances from './backoffice/Doleances';
import DoleanceDetail from './backoffice/DoleanceDetail';
import Users from './backoffice/Users';
import Roles from './backoffice/Roles';
import Statistiques from './backoffice/Statistiques';
import Profile from './backoffice/Profile';
import Notifications from './backoffice/Notifications';
import Directions from './backoffice/Directions';
import DirectionDoleances from './backoffice/DirectionDoleances';
import Transfert from './backoffice/Transfert';
import Settings from './backoffice/Settings';
import Historique from './backoffice/Historique';
import AjouterDoleance from './backoffice/AjouterDoleance';
import Corbeille from './backoffice/Corbeille';
import Categories from './backoffice/Categories';
import Messages from './backoffice/Messages';
import { ChatProvider } from './contexts/ChatContext';
import { CallProvider } from './contexts/CallContext';
import PrivateRoute from './components/PrivateRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Navigate to="/deposer-doleance" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/deposer-doleance" element={<PublicLayout><DeposerDoleance /></PublicLayout>} />
      <Route path="/suivi-doleance" element={<PublicLayout><SuiviDoleance /></PublicLayout>} />
      <Route path="/suivi-doleance/:reference" element={<PublicLayout><SuiviDoleance /></PublicLayout>} />
      <Route path="/toutes-doleances" element={<PublicLayout><ToutesDoleances /></PublicLayout>} />
      <Route path="/appeler-agent" element={<PublicLayout><AppelerAgent /></PublicLayout>} />
      
      {/* Routes back-office */}
      <Route path="/backoffice" element={<PrivateRoute><BackofficeLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/backoffice/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="doleances" element={<Doleances />} />
        <Route path="doleances/:id" element={<DoleanceDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="users" element={<PrivateRoute allowedRoles={['administrateur_systeme']} allowedPermissions={[{ module: 'users', action: 'view' }]}><Users /></PrivateRoute>} />
        <Route path="roles" element={<PrivateRoute allowedRoles={['administrateur_systeme']} allowedPermissions={[{ module: 'users', action: 'manage_roles' }]}><Roles /></PrivateRoute>} />
        <Route path="statistiques" element={<Statistiques />} />
        <Route path="historique" element={<Historique />} />
        <Route path="directions" element={<PrivateRoute allowedPermissions={[{ module: 'directions', action: 'view_team' }]}><Directions /></PrivateRoute>} />
        <Route path="direction/:id_direction" element={<PrivateRoute allowedPermissions={[{ module: 'directions', action: 'view_team' }]}><DirectionDoleances /></PrivateRoute>} />
        <Route path="transfert" element={<PrivateRoute allowedPermissions={[{ module: 'doleances', action: 'transfer' }]}><Transfert /></PrivateRoute>} />
        <Route path="ajouter-doleance" element={<PrivateRoute allowedPermissions={[{ module: 'doleances', action: 'create' }]}><AjouterDoleance /></PrivateRoute>} />
        <Route path="settings" element={<Settings />} />
        <Route path="corbeille" element={<PrivateRoute allowedRoles={['administrateur_systeme']}><Corbeille /></PrivateRoute>} />
        <Route path="categories" element={<PrivateRoute allowedPermissions={[{ module: 'doleances', action: 'update' }]}><Categories /></PrivateRoute>} />
        <Route path="messages" element={<ChatProvider><Messages /></ChatProvider>} />

      </Route>
      
      {/* Redirection 404 */}
      <Route path="*" element={<Navigate to="/deposer-doleance" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StatsProvider>
          <CallProvider>
            <AppRoutes />
          </CallProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </StatsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;