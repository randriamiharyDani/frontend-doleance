import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StatsProvider } from './contexts/StatsContext';
import LoadingSpinner from './components/common/LoadingSpinner';

// Layout public
const PublicLayout = lazy(() => import('./components/public/PublicLayout'));

// Pages publiques
const DeposerDoleance = lazy(() => import('./public/DeposerDoleance'));
const SuiviDoleance = lazy(() => import('./public/SuiviDoleance'));
const ToutesDoleances = lazy(() => import('./public/ToutesDoleances'));
const AppelerAgent = lazy(() => import('./public/AppelerAgent'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Back-office
const BackofficeLayout = lazy(() => import('./backoffice/BackofficeLayout'));
const Dashboard = lazy(() => import('./backoffice/Dashboard'));
const Doleances = lazy(() => import('./backoffice/Doleances'));
const DoleanceDetail = lazy(() => import('./backoffice/DoleanceDetail'));
const Users = lazy(() => import('./backoffice/Users'));
const Roles = lazy(() => import('./backoffice/Roles'));
const Statistiques = lazy(() => import('./backoffice/Statistiques'));
const Profile = lazy(() => import('./backoffice/Profile'));
const Notifications = lazy(() => import('./backoffice/Notifications'));
const Directions = lazy(() => import('./backoffice/Directions'));
const DirectionDoleances = lazy(() => import('./backoffice/DirectionDoleances'));
const Transfert = lazy(() => import('./backoffice/Transfert'));
const Settings = lazy(() => import('./backoffice/Settings'));
const Historique = lazy(() => import('./backoffice/Historique'));
const AjouterDoleance = lazy(() => import('./backoffice/AjouterDoleance'));
const Corbeille = lazy(() => import('./backoffice/Corbeille'));
const Categories = lazy(() => import('./backoffice/Categories'));
const AppelsCitoyens = lazy(() => import('./backoffice/AppelsCitoyens'));
const Messages = lazy(() => import('./backoffice/Messages'));
import { ChatProvider } from './contexts/ChatContext';
import { CallProvider } from './contexts/CallContext';
import PrivateRoute from './components/PrivateRoute';

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
{/* Route publique par défaut : la racine du site va au dépôt */}
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
          <Route path="appels-citoyens" element={<PrivateRoute allowedRoles={['administrateur_systeme', 'administrateur', 'agent_central']}><AppelsCitoyens /></PrivateRoute>} />
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
    </Suspense>
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