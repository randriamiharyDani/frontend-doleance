import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  PencilIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  FolderIcon,
  PaperClipIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

function Doleances() {

  const { user } = useAuth();

  const [doleances, setDoleances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoleance, setSelectedDoleance] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [loadingPieces, setLoadingPieces] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [selectedPriorite, setSelectedPriorite] = useState('');

  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [priorites, setPriorites] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [showFilters, setShowFilters] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doleanceToDelete, setDoleanceToDelete] = useState(null);

  const [showPrioriteModal, setShowPrioriteModal] = useState(false);
  const [doleanceToUpdate, setDoleanceToUpdate] = useState(null);
  const [selectedPrioriteValue, setSelectedPrioriteValue] = useState('');

  const [showReponseModal, setShowReponseModal] = useState(false);
  const [selectedDoleanceForReponse, setSelectedDoleanceForReponse] = useState(null);
  const [reponseText, setReponseText] = useState('');

  const [showStatutModal, setShowStatutModal] = useState(false);
  const [selectedStatutValue, setSelectedStatutValue] = useState('');

  // ROLES
  const userRole = user?.role || user?.nom_role;

  const isSuperAdmin = userRole === 'administrateur_systeme';
  const isAgentCentral = userRole === 'agent_central';
  const isDirecteur = userRole === 'directeur';
  const isChefService = userRole === 'chef_service';
  const isAgent = userRole === 'agent';
  const isAdminOrAgentCentral = isSuperAdmin || isAgentCentral;
  const canTraiter = isDirecteur || isChefService || isAgent;

  // STATUTS BLOQUES
  const statutsBloques = [
    'Résolue',
    'Rejetée',
    'Clôturée',
    'Fermée'
  ];

  const isModifiable = (statut) => {
    return !statutsBloques.includes(statut);
  };

  // Vérifier si une doléance est nouvelle (statut "En attente" ou "Nouvelle")
  const isNouvelleDoleance = (statut) => {
    return statut === 'En attente' || statut === 'Nouvelle' || statut === 'en_attente';
  };

  // TRI
  const sortByAlphabetical = (data, key = 'nom_categorie') => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) =>
      (a[key] || '').localeCompare(b[key] || '', 'fr')
    );
  };

  // FETCH
  useEffect(() => {
    fetchDoleances();
    fetchFilters();
  }, [
    pagination.page,
    selectedCategorie,
    selectedStatut,
    selectedPriorite,
    searchTerm
  ]);

  // CHARGER DOLEANCES
  const fetchDoleances = async () => {

    setLoading(true);

    try {

      const params = new URLSearchParams();

      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      if (selectedCategorie) {
        params.append('categorie', selectedCategorie);
      }

      if (selectedStatut) {
        params.append('statut', selectedStatut);
      }

      if (selectedPriorite) {
        params.append('priorite', selectedPriorite);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(
        `/doleances/backoffice?${params.toString()}`
      );

      if (response.data && response.data.success) {

        setDoleances(response.data.data.doleances || []);

        setPagination((prev) => ({
          ...prev,
          total: response.data.data.pagination?.total || 0,
          pages: response.data.data.pagination?.pages || 0
        }));
      }

    } catch (error) {

      console.error(error);
      toast.error('Erreur chargement doléances');

    } finally {

      setLoading(false);

    }
  };

  // CHARGER PIECES JOINTES - VERSION SIMPLIFIÉE ET CORRIGÉE
  const fetchPiecesJointes = async (doleanceId) => {
    setLoadingPieces(true);
    try {
      // Endpoint dédié aux pièces jointes (retourne le tableau avec les URLs)
      const response = await api.get(`/doleances/${doleanceId}/pieces-jointes`);
      if (response.data && response.data.success) {
        setPiecesJointes(response.data.data || []);
      } else {
        setPiecesJointes([]);
      }
    } catch (error) {
      console.warn('Erreur chargement pièces jointes:', error);
      setPiecesJointes([]);
    } finally {
      setLoadingPieces(false);
    }
  };

  // OUVRIE MODAL DETAILS
  const openDetailsModal = async (doleance) => {
    setSelectedDoleance(doleance);
    await fetchPiecesJointes(doleance.id_doleance);
    setShowDetailsModal(true);
  };

  // FILTRES
  const fetchFilters = async () => {

    try {

      const [
        categoriesRes,
        statutsRes,
        prioritesRes
      ] = await Promise.all([
        api.get('/doleances/categories'),
        api.get('/doleances/statuts'),
        api.get('/doleances/priorites')
      ]);

      let categoriesData =
        categoriesRes.data?.data ||
        categoriesRes.data ||
        [];

      categoriesData = sortByAlphabetical(
        categoriesData,
        'nom_categorie'
      );

      setCategories(categoriesData);

      setStatuts(
        statutsRes.data?.data ||
        statutsRes.data ||
        []
      );

      setPriorites(
        prioritesRes.data?.data ||
        prioritesRes.data ||
        []
      );

    } catch (error) {

      console.error(error);

    }
  };

  // RECHERCHE
  const handleSearch = (e) => {
    e.preventDefault();

    setPagination((prev) => ({
      ...prev,
      page: 1
    }));

    fetchDoleances();
  };

  // RESET
  const handleReset = () => {

    setSearchTerm('');
    setSelectedCategorie('');
    setSelectedStatut('');
    setSelectedPriorite('');

    setPagination((prev) => ({
      ...prev,
      page: 1
    }));

    fetchDoleances();
  };

  // SUPPRIMER
  const confirmDelete = (doleance) => {

    if (!isAdminOrAgentCentral) {
      toast.error('Vous n’avez pas les droits pour supprimer des doléances');
      return;
    }

    setDoleanceToDelete(doleance);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {

    try {

      const response = await api.delete(
        `/doleances/${doleanceToDelete.id_doleance}`
      );

      if (response.data && response.data.success) {

        toast.success('Doléance supprimée');
        fetchDoleances();

      }

    } catch (error) {

      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur suppression');

    } finally {

      setShowDeleteConfirm(false);
      setDoleanceToDelete(null);

    }
  };

  // PRIORITE
  const openPrioriteModal = (doleance) => {

    if (!isAdminOrAgentCentral) {
      toast.error('Accès refusé');
      return;
    }

    setDoleanceToUpdate(doleance);
    setSelectedPrioriteValue(doleance.id_priorite?.toString() || '');
    setShowPrioriteModal(true);
  };

  const handleUpdatePriorite = async () => {

    try {

      const response = await api.put(
        `/doleances/${doleanceToUpdate.id_doleance}/priorite`,
        { id_priorite: parseInt(selectedPrioriteValue) }
      );

      if (response.data && response.data.success) {

        toast.success('Priorité modifiée');
        fetchDoleances();
        setShowPrioriteModal(false);

      }

    } catch (error) {

      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur modification');

    }
  };

  // REPONSE - Avec vérification des droits
  const openReponseModal = (doleance) => {

    // Vérifier si la doléance est modifiable
    if (!isModifiable(doleance.nom_statut)) {
      toast.error('Cette doléance est verrouillée');
      return;
    }

    // IMPORTANT: Seul Super Admin et Agent Central peuvent répondre aux nouvelles doléances
    if (isNouvelleDoleance(doleance.nom_statut)) {
      if (!isAdminOrAgentCentral) {
        toast.error('Seul l\'administrateur peut répondre aux nouvelles doléances');
        return;
      }
    }

    // Pour les autres cas, vérifier si l'utilisateur a le droit d'agir sur cette doléance
    if (!isAdminOrAgentCentral) {
      // Pour les autres rôles, vérifier la direction
      if (doleance.id_direction !== user?.id_direction) {
        toast.error('Vous ne pouvez pas répondre à cette doléance');
        return;
      }
    }

    setSelectedDoleanceForReponse(doleance);
    setReponseText('');
    setShowReponseModal(true);
  };

  const handleSendReponse = async () => {

    if (!reponseText.trim()) {
      toast.error('Veuillez écrire une réponse');
      return;
    }

    try {

      const response = await api.post(
        `/doleances/${selectedDoleanceForReponse.id_doleance}/reponses`,
        { message: reponseText }
      );

      if (response.data && response.data.success) {

        toast.success('Réponse envoyée');
        setShowReponseModal(false);
        fetchDoleances();

      }

    } catch (error) {

      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur envoi');

    }
  };

  // STATUT
  const openStatutModal = (doleance) => {

    if (!isModifiable(doleance.nom_statut)) {
      toast.error('Cette doléance est verrouillée');
      return;
    }

    // Seul Super Admin et Agent Central peuvent changer le statut
    if (!isAdminOrAgentCentral) {
      toast.error('Seul l\'administrateur peut changer le statut');
      return;
    }

    setSelectedDoleanceForReponse(doleance);
    setSelectedStatutValue(doleance.id_statut?.toString() || '');
    setShowStatutModal(true);
  };

  const handleUpdateStatut = async () => {

    try {

      const response = await api.put(
        `/doleances/${selectedDoleanceForReponse.id_doleance}/statut`,
        { id_statut: parseInt(selectedStatutValue) }
      );

      if (response.data && response.data.success) {

        toast.success('Statut modifié');
        setShowStatutModal(false);
        fetchDoleances();

      }

    } catch (error) {

      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur modification');

    }
  };

  // Vérifier si l'utilisateur peut voir la doléance
  const canUserViewDoleance = (doleance) => {
    if (isAdminOrAgentCentral) return true;
    // Pour les autres rôles, ils peuvent voir les doléances de leur direction si non bloquées
    if (isModifiable(doleance.nom_statut) && doleance.id_direction === user?.id_direction) {
      return true;
    }
    return false;
  };

  // Vérifier si l'utilisateur peut agir sur la doléance
  const canUserActOnDoleance = (doleance) => {
    if (!isModifiable(doleance.nom_statut)) return false;
    if (isAdminOrAgentCentral) return true;
    
    // Si c'est une nouvelle doléance, seul l'admin peut agir
    if (isNouvelleDoleance(doleance.nom_statut)) {
      return false;
    }
    
    // Pour les autres rôles, ils peuvent agir sur les doléances de leur direction
    if (canTraiter && doleance.id_direction === user?.id_direction) return true;
    return false;
  };

  // BADGE STATUT
  const getStatusBadge = (statut, couleur) => {

    if (statut === 'Résolue') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500 text-white">✅ Résolue</span>;
    }
    if (statut === 'Rejetée') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500 text-white">❌ Rejetée</span>;
    }
    if (statut === 'Clôturée' || statut === 'Fermée') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500 text-white">🔒 Clôturée</span>;
    }

    return (
      <span
        className="px-2 py-1 text-xs rounded-full text-white"
        style={{ backgroundColor: couleur || '#6B7280' }}
      >
        {statut}
      </span>
    );
  };

  // BADGE PRIORITE
  const getPriorityBadge = (priorite, niveau) => {

    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[niveau] || 'bg-gray-100 text-gray-800'}`}>
        {priorite}
      </span>
    );
  };

  // DATE
  const formatDateTime = (dateString) => {

    if (!dateString) return '';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // ROLE LABEL
  const getRoleLabel = () => {

    if (isSuperAdmin) return 'Super Admin';
    if (isAgentCentral) return 'Agent Central';
    if (isDirecteur) return 'Directeur';
    if (isChefService) return 'Chef Service';
    if (isAgent) return 'Agent';
    return 'Utilisateur';
  };

  // ICONE PIECE JOINTE
  const getFileIcon = (file) => {
    const extension = file.nom_fichier?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
      return <PhotoIcon className="h-5 w-5 text-blue-500" />;
    }
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'ogg'].includes(extension)) {
      return <VideoCameraIcon className="h-5 w-5 text-purple-500" />;
    }
    return <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />;
  };

  // FORMATER TAILLE
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // CONSTRUIRE ADRESSE COMPLETE
  const buildFullAddress = (doleance) => {
    const parts = [];
    if (doleance.adresse_citoyen) parts.push(doleance.adresse_citoyen);
    if (doleance.lot) parts.push(`Lot ${doleance.lot}`);
    if (doleance.fokontany) parts.push(doleance.fokontany);
    if (doleance.arrondissement) parts.push(doleance.arrondissement);
    if (doleance.lieu_exact) parts.push(doleance.lieu_exact);
    return parts.join(', ');
  };

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des doléances
          </h1>

          <p className="text-gray-600 mt-1">
            Consultez et gérez les doléances des citoyens
          </p>

          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">

            <ShieldCheckIcon className="h-3 w-3" />

            {getRoleLabel()}

          </div>

          {!isAdminOrAgentCentral && (
            <div className="mt-2 text-xs text-gray-500">
              ℹ️ Vous ne pouvez voir que les détails des doléances NON RÉSOLUES de votre direction
            </div>
          )}

        </div>

      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">

          <div className="flex-1 relative">

            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

            <input
              type="text"
              placeholder="Rechercher par référence, titre, citoyen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              Filtres
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Réinitialiser
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Rechercher
            </button>

          </div>

        </form>

        {/* FILTRES */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={selectedCategorie}
                onChange={(e) => setSelectedCategorie(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom_categorie}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Tous les statuts</option>
                {statuts.map(statut => (
                  <option key={statut.id_statut} value={statut.id_statut}>{statut.nom_statut}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select
                value={selectedPriorite}
                onChange={(e) => setSelectedPriorite(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Toutes les priorités</option>
                {priorites.map(prio => (
                  <option key={prio.id_priorite} value={prio.id_priorite}>{prio.nom_priorite}</option>
                ))}
              </select>
            </div>

          </div>
        )}

      </div>

      {/* LISTE DES DOLEANCES */}
      {loading ? (

        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

      ) : doleances.length === 0 ? (

        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune doléance</h3>
        </div>

      ) : (

        <div className="space-y-4">

          {doleances.map((doleance) => {

            const userCanAct = canUserActOnDoleance(doleance);
            const userCanView = canUserViewDoleance(doleance);
            const estBloquee = !isModifiable(doleance.nom_statut);
            const estDeSaDirection = doleance.id_direction === user?.id_direction;
            const estNouvelle = isNouvelleDoleance(doleance.nom_statut);
            const fullAddress = buildFullAddress(doleance);

            // Si l'utilisateur n'est pas admin et que la doléance est bloquée ou pas de sa direction, on cache
            if (!isAdminOrAgentCentral && (!userCanView || estBloquee || !estDeSaDirection)) {
              return null;
            }

            return (

              <div
                key={doleance.id_doleance}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${estNouvelle ? 'border-l-4 border-blue-500' : ''}`}
              >

                <div className="p-6">

                  <div className="flex justify-between gap-4 flex-wrap">

                    {/* INFOS PRINCIPALES */}
                    <div className="flex-1">

                      {/* BADGES */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">

                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {doleance.reference}
                        </span>

                        {estNouvelle && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white animate-pulse">
                            🆕 Nouvelle
                          </span>
                        )}

                        {getPriorityBadge(doleance.nom_priorite, doleance.niveau)}
                        {getStatusBadge(doleance.nom_statut, doleance.statut_couleur)}

                        {doleance.nom_direction && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            🏢 {doleance.nom_direction}
                          </span>
                        )}

                        {estBloquee && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            🔒 Non modifiable
                          </span>
                        )}

                      </div>

                      {/* TITRE */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {doleance.titre}
                      </h3>

                      {/* DESCRIPTION COURTE */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {doleance.description}
                      </p>

                      {/* INFOS CITOYEN */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">

                        <span className="flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {doleance.citoyen_nom || 'Anonyme'} {doleance.citoyen_prenom || ''}
                        </span>

                        {doleance.telephone_citoyen && (
                          <span className="flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3" />
                            {doleance.telephone_citoyen}
                          </span>
                        )}

                        {doleance.email_citoyen && (
                          <span className="flex items-center gap-1">
                            <EnvelopeIcon className="h-3 w-3" />
                            {doleance.email_citoyen}
                          </span>
                        )}

                        {doleance.nom_categorie && (
                          <span className="flex items-center gap-1">
                            <FolderIcon className="h-3 w-3" />
                            {doleance.nom_categorie}
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDateTime(doleance.date_creation)}
                        </span>

                      </div>

                      {/* ADRESSE COMPLETE - CORRIGE */}
                      {fullAddress && (
                        <div className="flex items-start gap-1 text-xs text-gray-400 mt-1">
                          <MapPinIcon className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-500">
                            {fullAddress}
                          </span>
                        </div>
                      )}

                    </div>

                    {/* BOUTONS D'ACTION */}
                    <div className="flex items-center gap-2 flex-wrap">

                      {/* ADMIN - Priorité (Seul Super Admin et Agent Central) */}
                      {isAdminOrAgentCentral && (
                        <button
                          onClick={() => openPrioriteModal(doleance)}
                          className={`p-2 rounded-lg transition-colors ${estBloquee ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-600 hover:bg-yellow-50'}`}
                          disabled={estBloquee}
                          title="Changer la priorité"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* ADMIN - Supprimer (Seul Super Admin et Agent Central) */}
                      {isAdminOrAgentCentral && (
                        <button
                          onClick={() => confirmDelete(doleance)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* Répondre - Seulement si l'utilisateur peut agir */}
                      {userCanAct && (
                        <button
                          onClick={() => openReponseModal(doleance)}
                          className={`p-2 rounded-lg transition-colors ${
                            estNouvelle && !isAdminOrAgentCentral 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          disabled={estNouvelle && !isAdminOrAgentCentral}
                          title={estNouvelle && !isAdminOrAgentCentral ? "Seul l'administrateur peut répondre aux nouvelles doléances" : "Répondre"}
                        >
                          <ChatBubbleLeftRightIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* Changer statut (Seul Super Admin et Agent Central) */}
                      {isAdminOrAgentCentral && (
                        <button
                          onClick={() => openStatutModal(doleance)}
                          className={`p-2 rounded-lg transition-colors ${estBloquee ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'}`}
                          disabled={estBloquee}
                          title="Changer le statut"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* VOIR DETAILS (avec pièces jointes) */}
                      <button
                        onClick={() => openDetailsModal(doleance)}
                        className={`p-2 rounded-lg transition-colors ${!userCanView ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                        disabled={!userCanView}
                        title="Voir tous les détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      )}

      {/* PAGINATION */}
      {pagination.pages > 1 && (

        <div className="flex justify-center gap-2 mt-8">

          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <span className="px-4 py-2">
            {pagination.page} / {pagination.pages}
          </span>

          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>

        </div>

      )}

      {/* ========== MODAL DETAILS - CORRIGE ========== */}
      {showDetailsModal && selectedDoleance && (

        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

            {/* EN-TETE */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Détails complets de la doléance</h2>
                <p className="text-sm text-gray-500 font-mono">{selectedDoleance.reference}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* STATUT ET PRIORITE */}
              <div className="flex flex-wrap gap-3">
                {getPriorityBadge(selectedDoleance.nom_priorite, selectedDoleance.niveau)}
                {getStatusBadge(selectedDoleance.nom_statut, selectedDoleance.statut_couleur)}
                {selectedDoleance.nom_direction && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">🏢 {selectedDoleance.nom_direction}</span>
                )}
              </div>

              {/* TITRE */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedDoleance.titre}</h3>
              </div>

              {/* DESCRIPTION COMPLETE */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Description détaillée</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedDoleance.description}</p>
              </div>

              {/* INFORMATIONS CITOYEN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Informations du citoyen
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nom complet :</span> {selectedDoleance.citoyen_nom || ''} {selectedDoleance.citoyen_prenom || ''}</p>
                    {selectedDoleance.telephone_citoyen && (
                      <p><span className="font-medium">Téléphone :</span> {selectedDoleance.telephone_citoyen}</p>
                    )}
                    {selectedDoleance.email_citoyen && (
                      <p><span className="font-medium">Email :</span> {selectedDoleance.email_citoyen}</p>
                    )}
                    <p><span className="font-medium">Date de dépôt :</span> {formatDateTime(selectedDoleance.date_creation)}</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    Adresse complète
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Adresse :</span> {selectedDoleance.adresse_citoyen || 'Non renseignée'}</p>
                    {selectedDoleance.lot && <p><span className="font-medium">Lot :</span> {selectedDoleance.lot}</p>}
                    {selectedDoleance.fokontany && <p><span className="font-medium">Fokontany :</span> {selectedDoleance.fokontany}</p>}
                    {selectedDoleance.arrondissement && <p><span className="font-medium">Arrondissement :</span> {selectedDoleance.arrondissement}</p>}
                    {selectedDoleance.lieu_exact && <p><span className="font-medium">Lieu exact :</span> {selectedDoleance.lieu_exact}</p>}
                    {/* Adresse complète */}
                    {buildFullAddress(selectedDoleance) && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="font-medium text-green-700">📍 Adresse complète :</p>
                        <p className="text-gray-700">{buildFullAddress(selectedDoleance)}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* SUGGESTIONS */}
              {selectedDoleance.suggestions && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    Suggestions / Actions souhaitées
                  </h4>
                  <p className="text-gray-700">{selectedDoleance.suggestions}</p>
                </div>
              )}

              {/* PIECES JOINTES - CORRIGE */}
              <div className="bg-gray-50 rounded-lg p-4">

                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <PaperClipIcon className="h-4 w-4" />
                  Pièces jointes
                  {piecesJointes.length > 0 && (
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      {piecesJointes.length}
                    </span>
                  )}
                </h4>

                {loadingPieces ? (

                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>

                ) : piecesJointes.length === 0 ? (

                  <div className="text-center py-6">
                    <DocumentDuplicateIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Aucune pièce jointe disponible</p>
                  </div>

                ) : (

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                    {piecesJointes.map((file, index) => {
                      // Utiliser l'URL fournie par le backend (chemin vers le fichier static)
                      const downloadUrl = file.url || `/api/doleances/${selectedDoleance.id_doleance}/pieces-jointes/${file.id_piece || index}`;
                      
                      return (
                        <div key={index} className="bg-white rounded-lg border p-3 text-center hover:shadow-md transition-shadow relative group">

                          <div className="flex justify-center mb-2">
                            {getFileIcon(file)}
                          </div>

                          <p className="text-xs text-gray-600 truncate font-medium" title={file.nom_fichier}>
                            {file.nom_fichier}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {formatFileSize(file.taille)}
                          </p>

                          <div className="mt-2 flex justify-center gap-2">
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              <ArrowDownTrayIcon className="h-3 w-3" />
                              Télécharger
                            </a>
                          </div>

                        </div>
                      );
                    })}

                  </div>

                )}

              </div>

              {/* REPONSES */}
              {selectedDoleance.reponses && selectedDoleance.reponses.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    Historique des réponses ({selectedDoleance.reponses.length})
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedDoleance.reponses.map((rep, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-purple-400">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{rep.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDateTime(rep.date_reponse)} par {rep.agent_nom || 'Service municipal'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* FOOTER MODAL */}
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Fermer
              </button>
            </div>

          </div>

        </div>

      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteConfirm && doleanceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmation de suppression</h3>
              <p className="text-sm text-gray-500 mb-4">
                Supprimer la doléance <span className="font-semibold">{doleanceToDelete.reference}</span> ?
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRIORITE */}
      {showPrioriteModal && doleanceToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Changer la priorité</h3>
            <select
              value={selectedPrioriteValue}
              onChange={(e) => setSelectedPrioriteValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            >
              {priorites.map(prio => (
                <option key={prio.id_priorite} value={prio.id_priorite}>
                  {prio.nom_priorite} - Niveau {prio.niveau}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPrioriteModal(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button onClick={handleUpdatePriorite} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Modifier</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REPONSE */}
      {showReponseModal && selectedDoleanceForReponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-medium mb-2">Répondre à la doléance</h3>
            <p className="text-sm text-gray-500 mb-4">Référence: {selectedDoleanceForReponse.reference}</p>
            {isNouvelleDoleance(selectedDoleanceForReponse.nom_statut) && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-700">
                ⚠️ Cette doléance est en attente. L'administrateur doit la traiter en priorité.
              </div>
            )}
            <textarea
              value={reponseText}
              onChange={(e) => setReponseText(e.target.value)}
              rows="5"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Saisissez votre réponse..."
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReponseModal(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button onClick={handleSendReponse} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Envoyer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STATUT */}
      {showStatutModal && selectedDoleanceForReponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Changer le statut</h3>
            <select
              value={selectedStatutValue}
              onChange={(e) => setSelectedStatutValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            >
              {statuts.map(stat => (
                <option key={stat.id_statut} value={stat.id_statut}>{stat.nom_statut}</option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowStatutModal(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button onClick={handleUpdateStatut} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Modifier</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Doleances;