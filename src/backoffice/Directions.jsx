// Directions.jsx - Modifiez l'import
import React, { useState, useEffect } from 'react';
import api from '../services/api';  // Import par défaut
import toast from 'react-hot-toast';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

// Définissez les services directement dans le composant
const directionService = {
  getAll: async () => {
    const response = await api.get('/directions');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/directions/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/directions', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/directions/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/directions/${id}`);
    return response.data;
  }
};

const serviceService = {
  getAll: async () => {
    const response = await api.get('/services');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/services', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  }
};

function Directions() {
  // ... reste du code identique
}

export default Directions;