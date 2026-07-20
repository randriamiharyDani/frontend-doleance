import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  ClipboardDocumentIcon
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
  const [showEditDirectionModal, setShowEditDirectionModal] = useState(false);
  const [editDirectionData, setEditDirectionData] = useState({
    nom_direction: '',
    description: '',
    categorie: '',
    email: '',
    telephone: '',
    responsable: ''
  });
  const [showPasswordForAgent, setShowPasswordForAgent] = useState(null);
  const [agentPasswords, setAgentPasswords] = useState({});

  const categories = [
    'Sécurité', 'Administration', 'RH', 'Juridique', 'Finance', 'Marchés',
    'Urbanisme', 'Infrastructures', 'Transport', 'Environnement', 'Social',
    'Culture', 'Sports', 'Informatique', 'Arrondissement'
  ];

  useEffect(() => {
    fetchDirection();
    fetchUnassignedAgents();
  }, [id]);

  const fetchDirection = async () => {
    try {
      const response = await api.get(`/directions/${id}/details`);
      if (response.data.success) {
        const data = response.data.data;
        setDirection({
          ...data.direction,
          agents: data.agents || [],
          doleances: data.doleances || [],
          doleancestransferts: data.doleancestransferts || [],
          stats: data.stats || {}
        });
        setEditDirectionData({
          nom_direction: data.direction.nom_direction || '',
          description: data.direction.description || '',
          categorie: data.direction.categorie || '',
          email: data.direction.email || '',
          telephone: data.direction.telephone || '',
          responsable: data.direction.responsable || ''
        });
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
      const response = await api.get('/directions/users/without-direction');
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
      const response = await api.put(`/users/${selectedAgent}`, {
        id_direction: parseInt(id)
      });
      
      if (response.data.success) {
        toast.success('Agent assigné avec succès');
        setShowAssignModal(false);
        setSelectedAgent('');
        fetchDirection();
        fetchUnassignedAgents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateDirection = async () => {
    if (!editDirectionData.nom_direction.trim()) {
      toast.error('Le nom de la direction est requis');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/directions/${id}`, {
        nom_direction: editDirectionData.nom_direction,
        description: editDirectionData.description,
        categorie: editDirectionData.categorie,
        email: editDirectionData.email,
        telephone: editDirectionData.telephone,
        responsable: editDirectionData.responsable
      });
      
      if (response.data.success) {
        toast.success('Direction modifiée avec succès');
        setShowEditDirectionModal(false);
        fetchDirection();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAgent = async (agentId, agentName) => {
    if (window.confirm(`Retirer ${agentName} de cette direction ?`)) {
      try {
        const response = await api.put(`/users/${agentId}`, { id_direction: null });
        if (response.data.success) {
          toast.success('Agent retiré de la direction');
          fetchDirection();
          fetchUnassignedAgents();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur lors du retrait');
      }
    }
  };

  // Fonction pour récupérer le mot de passe d'un agent
  const fetchAgentPassword = async (agentId) => {
    try {
      const response = await api.get(`/users/${agentId}/password`);
      if (response.data.success) {
        setAgentPasswords(prev => ({
          ...prev,
          [agentId]: response.data.data.password
        }));
        setShowPasswordForAgent(agentId);
        toast.success('Mot de passe récupéré avec succès');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la récupération du mot de passe');
    }
  };

  // Fonction pour copier le mot de passe dans le presse-papiers
  const copyPasswordToClipboard = (password) => {
    navigator.clipboard.writeText(password).then(() => {
      toast.success('Mot de passe copié dans le presse-papiers');
    }).catch(() => {
      toast.error('Erreur lors de la copie');
    });
  };

  // Fonction pour basculer l'affichage du mot de passe
  const togglePasswordVisibility = (agentId) => {
    if (showPasswordForAgent === agentId) {
      setShowPasswordForAgent(null);
    } else {
      fetchAgentPassword(agentId);
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
        <button onClick={() => navigate('/backoffice/directions')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="max-auto">
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
              {direction.categorie && (
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 ml-2">
                  {direction.categorie}
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-3">{direction.description || 'Aucune description'}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {direction.email && (
                <span>📧 {direction.email}</span>
              )}
              {direction.telephone && (
                <span>📞 {direction.telephone}</span>
              )}
              {direction.responsable && (
                <span>👤 Responsable: {direction.responsable}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditDirectionModal(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2"
            >
              <PencilIcon className="h-5 w-5" />
              Modifier
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <UserPlusIcon className="h-5 w-5" />
              Assigner un agent
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{direction.agents?.length || 0}</p>
          <p className="text-sm text-gray-500">Agents</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <DocumentTextIcon className="h-8 w-8 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{direction.stats?.total_doleances || 0}</p>
          <p className="text-sm text-gray-500">Doléances totales</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <DocumentTextIcon className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{direction.stats?.doleances_traitees || 0}</p>
          <p className="text-sm text-gray-500">Doléances traitées</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <DocumentTextIcon className="h-8 w-8 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{direction.stats?.doleances_en_cours || 0}</p>
          <p className="text-sm text-gray-500">Doléances en cours</p>
        </div>
      </div>

      {/* Doléances de la direction */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Doléances de la direction</h2>
        {direction.doleances && direction.doleances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citoyen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {direction.doleances.slice(0, 10).map((doleance) => (
                  <tr key={doleance.id_doleance} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 line-clamp-2">
                      {doleance.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {doleance.citoyen_prenom} {doleance.citoyen_nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {doleance.nom_categorie}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        doleance.nom_statut === 'traitee' || doleance.nom_statut === 'resolue' || doleance.nom_statut === 'cloturee' 
                          ? 'bg-green-100 text-green-700' 
                          : doleance.nom_statut === 'transferee' 
                            ? 'bg-purple-100 text-purple-700'
                            : doleance.nom_statut === 'urgente'
                              ? 'bg-red-100 text-red-700'
                              : doleance.nom_statut === 'rejetee'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doleance.nom_statut || 'En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {doleance.date_creation ? new Date(doleance.date_creation).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {direction.doleances.length > 10 && (
              <div className="text-center text-sm text-gray-400 mt-3">
                + {direction.doleances.length - 10} autres doléances
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucune doléance pour cette direction</p>
        )}
      </div>

      {/* Agents de la direction avec mots de passe */}
      <div className="bg-white rounded-lg shadow-md p-6">
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mot de passe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {direction.agents.map((agent) => (
                  <tr key={agent.id_utilisateur} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {agent.prenom} {agent.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{agent.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {agent.nom_role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{agent.telephone || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {showPasswordForAgent === agent.id_utilisateur ? (
                          <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                            <KeyIcon className="h-4 w-4 text-yellow-600" />
                            <span className="font-mono text-sm text-gray-700">
                              {agentPasswords[agent.id_utilisateur] || '••••••••'}
                            </span>
                            <button
                              onClick={() => copyPasswordToClipboard(agentPasswords[agent.id_utilisateur])}
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              title="Copier le mot de passe"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">••••••••</span>
                        )}
                        <button
                          onClick={() => togglePasswordVisibility(agent.id_utilisateur)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title={showPasswordForAgent === agent.id_utilisateur ? "Masquer" : "Afficher le mot de passe"}
                        >
                          {showPasswordForAgent === agent.id_utilisateur ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleRemoveAgent(agent.id_utilisateur, `${agent.prenom} ${agent.nom}`)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Retirer
                      </button>
                    </td>
                  </tr>
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
              {unassignedAgents.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Aucun agent disponible. Tous les agents sont déjà assignés à une direction.
                </p>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={handleAssignAgent}
                disabled={assignLoading || !selectedAgent || unassignedAgents.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {assignLoading ? 'Assignation...' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de direction */}
      {showEditDirectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifier la direction</h3>
              <button onClick={() => setShowEditDirectionModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la direction *
              </label>
              <input
                type="text"
                value={editDirectionData.nom_direction}
                onChange={(e) => setEditDirectionData({...editDirectionData, nom_direction: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={editDirectionData.categorie}
                onChange={(e) => setEditDirectionData({...editDirectionData, categorie: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editDirectionData.description}
                onChange={(e) => setEditDirectionData({...editDirectionData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description de la direction..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editDirectionData.email}
                  onChange={(e) => setEditDirectionData({...editDirectionData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="exemple@domaine.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={editDirectionData.telephone}
                  onChange={(e) => setEditDirectionData({...editDirectionData, telephone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="01 23 45 67 89"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable
              </label>
              <input
                type="text"
                value={editDirectionData.responsable}
                onChange={(e) => setEditDirectionData({...editDirectionData, responsable: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom du responsable"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditDirectionModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={handleUpdateDirection}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectionDetail;