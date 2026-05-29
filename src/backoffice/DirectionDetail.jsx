import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function DirectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [direction, setDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [unassignedAgents, setUnassignedAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchDirection();
    fetchUnassignedAgents();
  }, [id]);

  const fetchDirection = async () => {
    try {
      const response = await api.get(`/directions/${id}`);
      if (response.data.success) {
        setDirection(response.data.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
      navigate('/backoffice/directions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedAgents = async () => {
    try {
      const response = await api.get('/directions/unassigned-agents');
      if (response.data.success) {
        setUnassignedAgents(response.data.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgent) {
      toast.error('Veuillez sélectionner un agent');
      return;
    }

    setAssignLoading(true);
    try {
      const response = await api.post('/directions/assign-agent', {
        id_direction: parseInt(id),
        id_utilisateur: parseInt(selectedAgent)
      });
      
      if (response.data.success) {
        toast.success('Agent assigné avec succès');
        setShowAssignModal(false);
        setSelectedAgent('');
        fetchDirection();
        fetchUnassignedAgents();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'assignation');
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!direction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Direction non trouvée</p>
        <button onClick={() => navigate('/backoffice/directions')} className="mt-4 btn-primary">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/backoffice/directions')} className="mb-4 flex items-center text-gray-600 hover:text-gray-800">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Retour aux directions
      </button>

      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">{direction.nom_direction}</h1>
            </div>
            {direction.categorie && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                {direction.categorie}
              </span>
            )}
            <p className="text-gray-600 mt-3">{direction.description || 'Aucune description'}</p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            Assigner un agent
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{direction.nb_agents || 0}</p>
          <p className="text-sm text-gray-500">Agents</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <DocumentTextIcon className="h-8 w-8 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{direction.doleances_en_cours || 0}</p>
          <p className="text-sm text-gray-500">Doléances en cours</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <BuildingOfficeIcon className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">-</p>
          <p className="text-sm text-gray-500">Taux de résolution</p>
        </div>
      </div>

      {/* Agents de la direction */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Agents de la direction</h2>
        {direction.agents && direction.agents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {direction.agents.map((agent) => (
                  <tr key={agent.id_utilisateur} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {agent.prenom} {agent.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{agent.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{agent.nom_role}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{agent.telephone || '-'}</td>
                  </td>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucun agent assigné à cette direction</p>
        )}
      </div>

      {/* Modal d'assignation */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Assigner un agent</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choisir un agent</option>
                {unassignedAgents.map(agent => (
                  <option key={agent.id_utilisateur} value={agent.id_utilisateur}>
                    {agent.prenom} {agent.nom} - {agent.nom_role}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={handleAssignAgent}
                disabled={assignLoading || !selectedAgent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {assignLoading ? 'Assignation...' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectionDetail;