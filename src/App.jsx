import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Layout public
import PublicLayout from './components/public/PublicLayout';

// Pages publiques
import DeposerDoleance from './public/DeposerDoleance';
import SuiviDoleance from './public/SuiviDoleance';
import ToutesDoleances from './public/ToutesDoleances';
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
      
      {/* Routes back-office */}
      <Route path="/backoffice" element={<BackofficeLayout />}>
        <Route index element={<Navigate to="/backoffice/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="doleances" element={<Doleances />} />
        <Route path="doleances/:id" element={<DoleanceDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="statistiques" element={<Statistiques />} />
        <Route path="historique" element={<Historique />} />
        <Route path="directions" element={<Directions />} />
        <Route path="direction/:id_direction" element={<DirectionDoleances />} />
        <Route path="transfert" element={<Transfert />} />
        <Route path="ajouter-doleance" element={<AjouterDoleance />} />
        <Route path="settings" element={<Settings />} />
        <Route path="corbeille" element={<Corbeille />} />
        <Route path="categories" element={<Categories />} />

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
        <LanguageProvider>
          <AppRoutes />
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
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;