// backoffice/DirectionDoleances.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  FolderIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

function DirectionDoleances() {
  const { id_direction } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [directionData, setDirectionData] = useState({
    direction: null,
    services: [],
    agents: [],
    doleances: [],
    doleancestransferts: [],
    stats: {}
  });
  const [activeTab, setActiveTab] = useState('doleances');
  const [selectedDoleance, setSelectedDoleance] = useState(null);
  const [showReponseModal, setShowReponseModal] = useState(false);
  const [reponseText, setReponseText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    statut: '',
    categorie: '',
    search: ''
  });
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [expandedDoleance, setExpandedDoleance] = useState(null);

  useEffect(() => {
    fetchDirectionDetails();
    fetchReferences();
  }, [id_direction]);

  const fetchDirectionDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/directions/${id_direction}/details`);
      if (response.data.success) {
        setDirectionData(response.data.data);
      } else {
        toast.error('Erreur lors du chargement des données');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des détails de la direction');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferences = async () => {
    try {
      const [categoriesRes, statutsRes] = await Promise.all([
        api.get('/doleances/categories'),
        api.get('/doleances/statuts')
      ]);
      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      setStatuts(statutsRes.data?.data || statutsRes.data || []);
    } catch (error) {
      console.error('Erreur chargement références:', error);
    }
  };

  const handleRepondre = async (e) => {
    e.preventDefault();
    if (!reponseText.trim()) {
      toast.error('Veuillez saisir une réponse');
      return;
    }

    setSending(true);
    try {
      const response = await api.post(`/doleances/${selectedDoleance.id_doleance}/reponses`, {
        message: reponseText
      });
      if (response.data.success) {
        toast.success('Réponse envoyée avec succès');
        setShowReponseModal(false);
        setReponseText('');
        fetchDirectionDetails();
      } else {
        toast.error(response.data.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de la réponse');
    } finally {
      setSending(false);
    }
  };

  const handleChangerStatut = async (doleanceId, nouveauStatut) => {
    try {
      const response = await api.patch(`/doleances/${doleanceId}/statut`, {
        id_statut: nouveauStatut,
        commentaire: `Statut changé par ${directionData.direction?.nom_direction}`
      });
      if (response.data.success) {
        toast.success('Statut mis à jour avec succès');
        fetchDirectionDetails();
      } else {
        toast.error(response.data.message || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const openReponseModal = (doleance) => {
    setSelectedDoleance(doleance);
    setReponseText('');
    setShowReponseModal(true);
  };

  const getStatusBadge = (statut, couleur) => {
    const statutsMap = {
      'en_attente': { text: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      'en_cours': { text: 'En cours', color: 'bg-blue-100 text-blue-800' },
      'transferee': { text: 'Transférée', color: 'bg-purple-100 text-purple-800' },
      'traitee': { text: 'Traitée', color: 'bg-green-100 text-green-800' },
      'rejetee': { text: 'Rejetée', color: 'bg-red-100 text-red-800' },
      'cloturee': { text: 'Clôturée', color: 'bg-gray-100 text-gray-800' }
    };
    const s = statutsMap[statut] || { text: statut || 'Inconnu', color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 text-xs rounded-full ${s.color}`}>{s.text}</span>;
  };

  const getPriorityBadge = (priorite, niveau) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[niveau] || 'bg-gray-100 text-gray-800'}`}>
        {priorite || 'Normal'}
      </span>
    );
  };

  const filteredDoleances = () => {
    let filtered = [...directionData.doleances];
    if (filters.statut) {
      filtered = filtered.filter(d => d.id_statut === parseInt(filters.statut));
    }
    if (filters.categorie) {
      filtered = filtered.filter(d => d.id_categorie === parseInt(filters.categorie));
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(d => 
        d.reference?.toLowerCase().includes(search) ||
        d.titre?.toLowerCase().includes(search) ||
        d.description?.toLowerCase().includes(search)
      );
    }
    return filtered;
  };

  const { direction, services, agents, stats } = directionData;

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
        <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Direction non trouvée</h2>
        <Link to="/backoffice/directions" className="mt-4 inline-block text-blue-600 hover:underline">
          Retour aux directions
        </Link>
      </div>
    );
  }

  const filteredDoleancesList = filteredDoleances();

  return (
    <div className="p-4 md:p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BuildingOfficeIcon className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{direction.nom_direction}</h1>
              <div className="flex flex-wrap gap-3 mt-2">
                {direction.categorie && (
                  <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    📁 {direction.categorie}
                  </span>
                )}
                {direction.email && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <EnvelopeIcon className="h-4 w-4" /> {direction.email}
                  </span>
                )}
                {direction.telephone && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <PhoneIcon className="h-4 w-4" /> {direction.telephone}
                  </span>
                )}
              </div>
              {direction.description && (
                <p className="text-gray-600 mt-3">{direction.description}</p>
              )}
            </div>
          </div>
          <Link
            to="/backoffice/directions"
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ← Retour
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total doléances</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.total_doleances || 0}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En cours</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.doleances_en_cours || 0}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Traitées</p>
              <p className="text-2xl font-bold text-green-600">{stats?.doleances_traitees || 0}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Agents / Services</p>
              <p className="text-2xl font-bold text-indigo-600">{agents?.length || 0} / {services?.length || 0}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('doleances')}
            className={`pb-3 px-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'doleances'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
            Doléances ({filteredDoleancesList.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 px-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'services'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FolderIcon className="h-4 w-4" />
            Services ({services?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`pb-3 px-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'agents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserGroupIcon className="h-4 w-4" />
            Agents ({agents?.length || 0})
          </button>
        </nav>
      </div>

      {/* Onglet Doléances */}
      {activeTab === 'doleances' && (
        <div>
          {/* Filtres */}
          <div className="bg-white rounded-lg shadow mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Filtres</span>
                {(filters.statut || filters.categorie || filters.search) && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Actifs</span>
                )}
              </div>
              {showFilters ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
            </button>
            
            {showFilters && (
              <div className="border-t p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={filters.statut}
                      onChange={(e) => setFilters({...filters, statut: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">Tous</option>
                      {statuts.map(s => (
                        <option key={s.id_statut} value={s.id_statut}>{s.nom_statut}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Catégorie</label>
                    <select
                      value={filters.categorie}
                      onChange={(e) => setFilters({...filters, categorie: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">Toutes</option>
                      {categories.map(c => (
                        <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Recherche</label>
                    <input
                      type="text"
                      placeholder="Référence, titre..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setFilters({ statut: '', categorie: '', search: '' })}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Liste des doléances */}
          <div className="space-y-4">
            {filteredDoleancesList.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Aucune doléance trouvée</p>
              </div>
            ) : (
              filteredDoleancesList.map((doleance) => (
                <div key={doleance.id_doleance} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-yellow-400">
                  <div className="p-5">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div className="flex-1">
                        {/* En-tête */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <code className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {doleance.reference}
                          </code>
                          {getPriorityBadge(doleance.nom_priorite, doleance.niveau)}
                          {getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}
                          <span className="text-xs text-gray-400">
                            {new Date(doleance.date_creation).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Titre */}
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">{doleance.titre}</h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                          {doleance.description}
                        </p>
                        
                        {/* Infos citoyen */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>👤 {doleance.citoyen_nom || 'Non renseigné'}</span>
                          {doleance.citoyen_telephone && <span>📞 {doleance.citoyen_telephone}</span>}
                          {doleance.citoyen_email && <span>✉️ {doleance.citoyen_email}</span>}
                        </div>
                        
                        {/* Boutons d'action */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => openReponseModal(doleance)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            Répondre
                          </button>
                          
                          <select
                            onChange={(e) => handleChangerStatut(doleance.id_doleance, e.target.value)}
                            value={doleance.id_statut}
                            className="px-3 py-1.5 border rounded-lg text-sm"
                          >
                            {statuts.map(s => (
                              <option key={s.id_statut} value={s.id_statut}>
                                {s.nom_statut}
                              </option>
                            ))}
                          </select>
                          
                          <Link
                            to={`/backoffice/doleances/${doleance.id_doleance}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                            Voir détails
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Onglet Services */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services?.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-12 text-center">
              <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Aucun service pour cette direction</p>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id_service} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{service.nom_service}</h3>
                    {service.responsable && (
                      <p className="text-xs text-gray-500">Responsable: {service.responsable}</p>
                    )}
                  </div>
                </div>
                {service.description && (
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {service.email && <span>📧 {service.email}</span>}
                  {service.telephone && <span>📞 {service.telephone}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Onglet Agents */}
      {activeTab === 'agents' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {agents?.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Aucun agent affecté à cette direction</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr key={agent.id_utilisateur} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {agent.prenom?.charAt(0)}{agent.nom?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{agent.prenom} {agent.nom}</p>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.telephone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {agent.nom_role?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${agent.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {agent.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de réponse */}
      {showReponseModal && selectedDoleance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Répondre à la doléance
              </h3>
              <button
                onClick={() => setShowReponseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Référence:</span> {selectedDoleance.reference}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Citoyen:</span> {selectedDoleance.citoyen_nom || 'Non renseigné'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Titre:</span> {selectedDoleance.titre}
                </p>
              </div>
              
              <form onSubmit={handleRepondre}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre réponse *
                  </label>
                  <textarea
                    value={reponseText}
                    onChange={(e) => setReponseText(e.target.value)}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Saisissez votre réponse ici..."
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReponseModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4" />
                        Envoyer la réponse
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectionDoleances;