import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// allowedRoles : liste de rôles autorisés (comportement historique)
// allowedPermissions : liste de { module, action } — l'accès est accordé si
//   le rôle est autorisé OU si une permission correspond (hasPermission inclut
//   le bypass des rôles admin). Ne casse donc pas le rôle-based existant.
const PrivateRoute = ({ children, allowedRoles = [], allowedPermissions = [] }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role || user.nom_role || user.role_nom;

  const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(role);
  const hasRequiredPermission =
    allowedPermissions.length === 0 ||
    allowedPermissions.some((p) => p && hasPermission(p.module, p.action));

  const accessGranted = hasRequiredRole || hasRequiredPermission;

  if (!accessGranted) {
    return <Navigate to="/backoffice/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
