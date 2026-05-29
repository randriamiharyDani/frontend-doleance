import api from './api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      const user = authService.getCurrentUser();
      if (user) {
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', { oldPassword, newPassword });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  }
};

export default authService;