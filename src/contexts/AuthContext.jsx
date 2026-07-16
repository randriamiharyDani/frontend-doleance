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
            await api.get('/auth/profile');
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};