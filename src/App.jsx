import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Pages publiques
import Accueil from './public/Accueil';
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
import TransfertDoleances from './backoffice/TransfertDoleances';
import Directions from './backoffice/Directions';

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Accueil />} />
      <Route path="/login" element={<Login />} />
      <Route path="/deposer-doleance" element={<DeposerDoleance />} />
      <Route path="/suivi-doleance" element={<SuiviDoleance />} />
      <Route path="/suivi-doleance/:reference" element={<SuiviDoleance />} />
      <Route path="/toutes-doleances" element={<ToutesDoleances />} />
      
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
        <Route path="transfert" element={<TransfertDoleances />} />
        <Route path="directions" element={<Directions />} />
      </Route>
      
      {/* Redirection */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;