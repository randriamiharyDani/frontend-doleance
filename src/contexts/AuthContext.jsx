import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Vérifier si le token est encore valide
          try {
            await api.get('/auth/profile');
          } catch (error) {
            if (error.response?.status === 401) {
              // Token invalide, déconnexion
              logout();
            }
          }
        } catch (error) {
          console.error('Erreur chargement utilisateur:', error);
          logout();
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Connexion réussie');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Déconnexion réussie');
    window.location.href = '/login'; // Redirection forcée
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};