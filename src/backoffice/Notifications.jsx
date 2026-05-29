import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, lu: true } : n
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Notifications</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500">Vous n'avez aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 hover:bg-gray-50 cursor-pointer ${!notif.lu ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(notif.id_notification)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{notif.titre}</h3>
                    <p className="text-gray-600">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notif.date_notification).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  {!notif.lu && (
                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;