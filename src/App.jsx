import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Pages publiques
import DeposerDoleance from './public/DeposerDoleance';
import SuiviDoleance from './public/SuiviDoleance';
import ToutesDoleances from './public/ToutesDoleances';
import Login from './pages/Login';

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

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Navigate to="/deposer-doleance" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/deposer-doleance" element={<DeposerDoleance />} />
      <Route path="/suivi-doleance" element={<SuiviDoleance />} />
      <Route path="/suivi-doleance/:reference" element={<SuiviDoleance />} />
      {/* <Route path="/toutes-doleances" element={<ToutesDoleances />} /> */}
      
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
        <Route path="directions" element={<Directions />} />
        <Route path="direction/:id_direction" element={<DirectionDoleances />} />
        <Route path="transfert" element={<Transfert />} />
        <Route path="settings" element={<Settings />} />
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