import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  BellIcon, 
  CheckCircleIcon, 
  DocumentTextIcon,
  UserIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isSuperAdmin = user?.role === 'administrateur_systeme' || 
                       user?.nom_role === 'administrateur_systeme';

  useEffect(() => {
    fetchNotifications();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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
        n.id_notification === id ? { ...n, lu: true } : n
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, lu: true })));
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du marquage des notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id_notification !== id));
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const viewDetails = (notif) => {
    setSelectedNotification(notif);
    setShowModal(true);
    if (!notif.lu) {
      markAsRead(notif.id_notification);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'nouvelle_doleance':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'modification_utilisateur':
        return <UserIcon className="h-5 w-5 text-green-500" />;
      case 'reset_password':
        return <KeyIcon className="h-5 w-5 text-orange-500" />;
      case 'modification_profil':
        return <UserIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'nouvelle_doleance':
        return 'bg-blue-50 border-blue-200';
      case 'modification_utilisateur':
        return 'bg-green-50 border-green-200';
      case 'reset_password':
        return 'bg-orange-50 border-orange-200';
      case 'modification_profil':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 text-sm mt-1">
            Suivez les activités importantes
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
            </div>
            <BellIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Non lues</p>
              <p className="text-2xl font-bold text-yellow-600">{unreadCount}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nouvelles doléances</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.type === 'nouvelle_doleance').length}
              </p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Modifications</p>
              <p className="text-2xl font-bold text-purple-600">
                {notifications.filter(n => n.type === 'modification_utilisateur' || n.type === 'reset_password').length}
              </p>
            </div>
            <KeyIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Historique des notifications
          </h2>
        </div>
        
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
                key={notif.id_notification} 
                className={`p-4 hover:bg-gray-50 transition-colors ${!notif.lu ? 'bg-blue-50' : ''} ${getNotificationColor(notif.type)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 cursor-pointer" onClick={() => viewDetails(notif)}>
                    <div className="flex items-center gap-2 mb-1">
                      {getNotificationIcon(notif.type)}
                      <h3 className={`font-semibold ${!notif.lu ? 'text-blue-800' : 'text-gray-800'}`}>
                        {notif.titre}
                      </h3>
                      {!notif.lu && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notif.date_notification).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {notif.details && (
                      <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        {notif.details}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notif.lu && (
                      <button
                        onClick={() => markAsRead(notif.id_notification)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Marquer comme lu"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id_notification)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                {getNotificationIcon(selectedNotification.type)}
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedNotification.titre}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>
              
              {selectedNotification.details && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Détails :</span><br />
                    {selectedNotification.details}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Reçu le : {new Date(selectedNotification.date_notification).toLocaleString('fr-FR')}</span>
                <span>Statut : {selectedNotification.lu ? 'Lu' : 'Non lu'}</span>
              </div>
            </div>
            
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;