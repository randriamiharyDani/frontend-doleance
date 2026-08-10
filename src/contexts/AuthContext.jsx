import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import socket from '../config/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectSocket = (userData, token) => {
    if (!userData || !token) return;
    const userId = userData.id || userData.id_utilisateur;
    const userName = `${userData.prenom || ''} ${userData.nom || ''}`.trim() || 'Utilisateur';
    const userRole = userData.role || userData.nom_role || '';
    socket.connect(token, userId, userName, userRole);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          connectSocket(parsedUser, token);
          
          try {
            const profileRes = await api.get('/auth/profile');
            const fresh = profileRes.data?.data;
            if (fresh) {
              const updatedUser = {
                ...parsedUser,
                ...fresh,
                role: fresh.nom_role || fresh.role_nom || parsedUser.role,
                nom_role: fresh.nom_role || parsedUser.nom_role,
                role_nom: fresh.role_nom || parsedUser.role_nom,
                permissions: fresh.permissions || parsedUser.permissions,
                role_permissions: fresh.role_permissions || parsedUser.role_permissions,
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
            }
          } catch (error) {
            if (error.response?.status === 401) {
              logout(true);
            }
          }
        } catch (error) {
          console.error('Erreur chargement utilisateur:', error);
          logout(true);
        }
      }
      setLoading(false);
    };
    
    checkAuth();

    return () => {
      socket.disconnect();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      connectSocket(user, token);
      
      toast.success('Connexion réussie');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
      return false;
    }
  };

  const logout = (silent = false) => {
    socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    if (!silent) {
      toast.success('Déconnexion réussie');
    }
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  // Vérifie si l'utilisateur a une permission (module.action)
  // Retourne true si le rôle a la permission OU est un rôle admin historique
  const hasPermission = (module, action) => {
    if (!user) return false;
    const role = user.role || user.nom_role || user.role_nom;

    const adminRoles = ['administrateur_systeme', 'administrateur', 'agent_central'];
    if (adminRoles.includes(role)) return true;

    let perms = user.permissions || user.role_permissions;
    if (typeof perms === 'string') {
      try {
        perms = JSON.parse(perms);
      } catch (e) {
        return false;
      }
    }
    if (!perms || typeof perms !== 'object') return false;

    const allPerms = perms.all;
    if (allPerms === true || allPerms === '*') return true;
    if (Array.isArray(allPerms) && (allPerms.includes('*') || allPerms.includes(action))) {
      return true;
    }

    const modulePerms = perms[module];
    if (modulePerms === true || modulePerms === '*') return true;
    if (Array.isArray(modulePerms)) {
      return modulePerms.includes('*') || modulePerms.includes(action);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, permissions: user?.permissions || user?.role_permissions || {}, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};