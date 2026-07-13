import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import doleanceService from '../services/doleanceService';
import toast from 'react-hot-toast';
import { STATUTS_BLOQUES } from '../pages/backoffice/Doleances/DoleanceCard';
import DoleanceHeader from '../pages/backoffice/Doleances/DoleanceHeader';
import DoleanceFilters from '../pages/backoffice/Doleances/DoleanceFilters';
import DoleanceCard from '../pages/backoffice/Doleances/DoleanceCard';
import DoleanceDetailModal from '../pages/backoffice/Doleances/DoleanceDetailModal';
import DeleteConfirmModal from '../pages/backoffice/Doleances/DeleteConfirmModal';
import PrioriteModal from '../pages/backoffice/Doleances/PrioriteModal';
import ReponseModal from '../pages/backoffice/Doleances/ReponseModal';
import StatutModal from '../pages/backoffice/Doleances/StatutModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

function Doleances() {
  const { user } = useAuth();
  const userRole = user?.role || user?.nom_role;
  const isSuperAdmin = userRole === 'administrateur_systeme';
  const isAgentCentral = userRole === 'agent_central';
  const isDirecteur = userRole === 'directeur';
  const isChefService = userRole === 'chef_service';
  const isAgent = userRole === 'agent';
  const isAdminOrAgentCentral = isSuperAdmin || isAgentCentral;
  const canTraiter = isDirecteur || isChefService || isAgent;

  const [doleances, setDoleances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [priorites, setPriorites] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [selectedPriorite, setSelectedPriorite] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const [selectedDoleance, setSelectedDoleance] = useState(null);
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [loadingPieces, setLoadingPieces] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const isNouvelle = (statut) => ['En attente', 'Nouvelle', 'en_attente'].includes(statut);
  const isBloquee = (statut) => STATUTS_BLOQUES.includes(statut);

  const sortByAlphabetical = (data, key = 'nom_categorie') => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => (a[key] || '').localeCompare(b[key] || '', 'fr'));
  };

  const buildFullAddress = (d) => {
    const parts = [];
    if (d.adresse_citoyen) parts.push(d.adresse_citoyen);
    if (d.lot) parts.push(`Lot ${d.lot}`);
    if (d.fokontany) parts.push(d.fokontany);
    if (d.arrondissement) parts.push(d.arrondissement);
    if (d.lieu_exact) parts.push(d.lieu_exact);
    return parts.join(', ');
  };

  const fetchDoleances = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (selectedCategorie) params.categorie = selectedCategorie;
      if (selectedStatut) params.statut = selectedStatut;
      if (selectedPriorite) params.priorite = selectedPriorite;
      if (searchTerm) params.search = searchTerm;

      const result = await doleanceService.getBackoffice(params);
      if (result?.success) {
        setDoleances(result.data.data?.doleances || []);
        setPagination(prev => ({
          ...prev,
          total: result.data.data?.pagination?.total || 0,
          pages: result.data.data?.pagination?.pages || 0
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur chargement doléances');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, selectedCategorie, selectedStatut, selectedPriorite, searchTerm]);

  const fetchFilters = useCallback(async () => {
    try {
      const [categoriesRes, statutsRes, prioritesRes] = await Promise.all([
        doleanceService.getCategories(),
        doleanceService.getStatuts(),
        doleanceService.getPriorites()
      ]);
      setCategories(sortByAlphabetical(categoriesRes?.data || [], 'nom_categorie'));
      setStatuts(statutsRes?.data || []);
      setPriorites(prioritesRes?.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => { fetchDoleances(); fetchFilters(); }, [fetchDoleances, fetchFilters]);

  const fetchPiecesJointes = async (doleanceId) => {
    setLoadingPieces(true);
    try {
      const result = await doleanceService.getPiecesJointes(doleanceId);
      setPiecesJointes(result?.data || []);
    } catch {
      setPiecesJointes([]);
    } finally {
      setLoadingPieces(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); setPagination(prev => ({ ...prev, page: 1 })); fetchDoleances(); };
  const handleReset = () => {
    setSearchTerm(''); setSelectedCategorie(''); setSelectedStatut(''); setSelectedPriorite('');
    setPagination(prev => ({ ...prev, page: 1 })); fetchDoleances();
  };

  const openDetailsModal = async (doleance) => {
    setSelectedDoleance(doleance);
    await fetchPiecesJointes(doleance.id_doleance);
    setShowDetailsModal(true);
  };

  const confirmDelete = (doleance) => {
    if (!isAdminOrAgentCentral) { toast.error('Vous n\'avez pas les droits'); return; }
    setDoleanceToDelete(doleance);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const result = await doleanceService.delete(doleanceToDelete.id_doleance);
      if (result?.success) { toast.success('Doléance supprimée'); fetchDoleances(); }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur suppression');
    } finally {
      setShowDeleteConfirm(false); setDoleanceToDelete(null);
    }
  };

  const openPrioriteModal = (doleance) => {
    if (!isAdminOrAgentCentral) { toast.error('Accès refusé'); return; }
    setDoleanceToUpdate(doleance);
    setSelectedPrioriteValue(doleance.id_priorite?.toString() || '');
    setShowPrioriteModal(true);
  };

  const handleUpdatePriorite = async () => {
    try {
      const result = await doleanceService.updatePriorite(doleanceToUpdate.id_doleance, parseInt(selectedPrioriteValue));
      if (result?.success) { toast.success('Priorité modifiée'); fetchDoleances(); setShowPrioriteModal(false); }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur modification');
    }
  };

  const openReponseModal = (doleance) => {
    if (isBloquee(doleance.nom_statut)) { toast.error('Cette doléance est verrouillée'); return; }
    if (isNouvelle(doleance.nom_statut) && !isAdminOrAgentCentral) { toast.error('Seul l\'administrateur peut répondre aux nouvelles doléances'); return; }
    if (!isAdminOrAgentCentral && doleance.id_direction !== user?.id_direction) { toast.error('Vous ne pouvez pas répondre à cette doléance'); return; }
    setSelectedDoleanceForReponse(doleance);
    setReponseText('');
    setShowReponseModal(true);
  };

  const handleSendReponse = async () => {
    if (!reponseText.trim()) { toast.error('Veuillez écrire une réponse'); return; }
    try {
      const result = await doleanceService.addReponse(selectedDoleanceForReponse.id_doleance, reponseText);
      if (result?.success) { toast.success('Réponse envoyée'); setShowReponseModal(false); fetchDoleances(); }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur envoi');
    }
  };

  const openStatutModal = (doleance) => {
    if (isBloquee(doleance.nom_statut)) { toast.error('Cette doléance est verrouillée'); return; }
    if (!isAdminOrAgentCentral) { toast.error('Seul l\'administrateur peut changer le statut'); return; }
    setSelectedDoleanceForReponse(doleance);
    setSelectedStatutValue(doleance.id_statut?.toString() || '');
    setShowStatutModal(true);
  };

  const handleUpdateStatut = async () => {
    try {
      const result = await doleanceService.updateStatut(selectedDoleanceForReponse.id_doleance, parseInt(selectedStatutValue));
      if (result?.success) { toast.success('Statut modifié'); setShowStatutModal(false); fetchDoleances(); }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur modification');
    }
  };

  const canUserView = (doleance) => isAdminOrAgentCentral || (!isBloquee(doleance.nom_statut) && doleance.id_direction === user?.id_direction);

  const canUserAct = (doleance) => {
    if (isBloquee(doleance.nom_statut)) return false;
    if (isAdminOrAgentCentral) return true;
    if (isNouvelle(doleance.nom_statut)) return false;
    if (canTraiter && doleance.id_direction === user?.id_direction) return true;
    return false;
  };

  return (
    <div>

      <DoleanceHeader userRole={userRole} isAdminOrAgentCentral={isAdminOrAgentCentral} />

      <DoleanceFilters
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        onSubmit={handleSearch} onReset={handleReset}
        showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)}
        selectedCategorie={selectedCategorie} onCategorieChange={setSelectedCategorie}
        selectedStatut={selectedStatut} onStatutChange={setSelectedStatut}
        selectedPriorite={selectedPriorite} onPrioriteChange={setSelectedPriorite}
        categories={categories} statuts={statuts} priorites={priorites}
      />

      {loading ? (
        <LoadingSpinner text="Chargement des doléances..." />
      ) : doleances.length === 0 ? (
        <EmptyState icon={DocumentTextIcon} title="Aucune doléance" description="Aucune doléance ne correspond à vos critères." />
      ) : (
        <div className="space-y-4">
          {doleances.map((doleance) => (
            <DoleanceCard
              key={doleance.id_doleance}
              doleance={doleance}
              user={user}
              isAdminOrAgentCentral={isAdminOrAgentCentral}
              canTraiter={canTraiter}
              onView={openDetailsModal}
              onDelete={confirmDelete}
              onPriorite={openPrioriteModal}
              onReponse={openReponseModal}
              onStatut={openStatutModal}
              isNouvelle={isNouvelle(doleance.nom_statut)}
              isBloquee={isBloquee(doleance.nom_statut)}
              isDeSaDirection={doleance.id_direction === user?.id_direction}
              userCanAct={canUserAct(doleance)}
              userCanView={canUserView(doleance)}
              fullAddress={buildFullAddress(doleance)}
            />
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))} />

      <DoleanceDetailModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        doleance={selectedDoleance}
        piecesJointes={piecesJointes}
        loadingPieces={loadingPieces}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDoleanceToDelete(null); }}
        onConfirm={handleDelete}
        doleance={doleanceToDelete}
      />

      <PrioriteModal
        isOpen={showPrioriteModal}
        onClose={() => setShowPrioriteModal(false)}
        onConfirm={handleUpdatePriorite}
        priorites={priorites}
        selectedValue={selectedPrioriteValue}
        onValueChange={setSelectedPrioriteValue}
        doleance={doleanceToUpdate}
      />

      <ReponseModal
        isOpen={showReponseModal}
        onClose={() => setShowReponseModal(false)}
        onSend={handleSendReponse}
        reponseText={reponseText}
        onTextChange={setReponseText}
        doleance={selectedDoleanceForReponse}
        isNouvelle={isNouvelle(selectedDoleanceForReponse?.nom_statut)}
      />

      <StatutModal
        isOpen={showStatutModal}
        onClose={() => setShowStatutModal(false)}
        onConfirm={handleUpdateStatut}
        statuts={statuts}
        selectedValue={selectedStatutValue}
        onValueChange={setSelectedStatutValue}
        doleance={selectedDoleanceForReponse}
      />
    </div>
  );
}

export default Doleances;
