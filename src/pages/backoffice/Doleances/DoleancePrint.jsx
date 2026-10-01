import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PrinterIcon,
  UserCircleIcon,
  MapPinIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import doleanceService from '../../../services/doleanceService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const valueOrDash = (value) => {
  if (value === null || value === undefined) return '—';
  const text = String(value).trim();
  return text === '' ? '—' : text;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

function InfoRow({ label, value }) {
  return (
    <div className="print-row">
      <dt className="print-row-label">{label}</dt>
      <dd className="print-row-value">{valueOrDash(value)}</dd>
    </div>
  );
}

function PrintSection({ icon: Icon, title, children, className = '' }) {
  return (
    <section className={`print-section ${className}`.trim()}>
      <h2 className="print-section-title">
        {Icon && <Icon className="print-section-icon" aria-hidden="true" />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function DoleancePrint() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doleance, setDoleance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchDoleance = async () => {
      setLoading(true);
      try {
        const result = await doleanceService.getById(id);
        if (!active) return;
        if (result?.success && result.data?.data) {
          setDoleance(result.data.data);
        } else {
          toast.error(result?.message || 'Doléance non trouvée');
          navigate('/backoffice/doleances', { replace: true });
        }
      } catch (error) {
        if (!active) return;
        console.error(error);
        toast.error('Erreur lors du chargement de la doléance');
        navigate('/backoffice/doleances', { replace: true });
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDoleance();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const handlePrint = () => {
    setPrinting(true);
    window.print();
    window.setTimeout(() => setPrinting(false), 800);
  };

  if (loading) return <LoadingSpinner text="Préparation de la fiche..." />;

  if (!doleance) return null;

  const citoyenNom = [doleance.citoyen_prenom, doleance.citoyen_nom].filter(Boolean).join(' ').trim();

  return (
    <div className="print-root">
      <div className="no-print print-toolbar">
        <button
          type="button"
          onClick={() => navigate(`/backoffice/doleances/${doleance.id_doleance}`)}
          className="print-toolbar-btn"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Retour à la fiche
        </button>
        <button
          type="button"
          onClick={handlePrint}
          disabled={printing}
          className="print-toolbar-btn print-toolbar-btn-primary"
        >
          <PrinterIcon className="h-4 w-4" aria-hidden="true" />
          {printing ? 'Impression...' : 'Imprimer'}
        </button>
      </div>

      <article id="print-doc" className="print-doc">
        <header className="print-doc-header">
          <img className="print-logo" src={`${import.meta.env.BASE_URL}images/logo_CUA.svg`} alt="Logo CUA" />
          <div className="print-doc-header-text">
            <h1>COMMUNE URBAINE D&apos;ANTANANARIVO</h1>
            {/* <h2>DELEGATION SPECIALE</h2> */}
          </div>
          <p className="print-doc-header-motto">DOLEANCE</p>
        </header>

        <div className="print-doc-title">
          <p className="print-doc-type">Fiche de doléance</p>
          <h3>{valueOrDash(doleance.titre)}</h3>
          <div className="print-doc-badges">
            <span className="print-badge">Réf. {valueOrDash(doleance.reference)}</span>
            <span className="print-badge">Déposée le {formatDate(doleance.date_creation)}</span>
          </div>
        </div>

        <div className="print-columns">
          <PrintSection icon={TagIcon} title="Identification et suivi">
            <dl className="print-rows">
              <InfoRow label="Référence" value={doleance.reference} />
              <InfoRow label="Catégorie" value={doleance.nom_categorie} />
              <InfoRow label="Date de dépôt" value={formatDateTime(doleance.date_creation)} />
              <InfoRow label="Direction" value={doleance.nom_direction} />
            </dl>
          </PrintSection>

          <PrintSection icon={MapPinIcon} title="Localisation">
            <dl className="print-rows">
              <InfoRow label="Arrondissement" value={doleance.nom_arrondissement} />
              <InfoRow label="Quartier / Fokontany" value={doleance.nom_quartier} />
              <InfoRow label="Lieu exact" value={doleance.lieu_exact} />
              <InfoRow label="Adresse du plaignant" value={doleance.citoyen_adresse} />
            </dl>
          </PrintSection>
        </div>

        <PrintSection icon={UserCircleIcon} title="Informations du plaignant">
          <dl className="print-rows print-rows-inline">
            <InfoRow label="Nom complet" value={citoyenNom} />
            <InfoRow label="Téléphone" value={doleance.citoyen_telephone} />
            <InfoRow label="Email" value={doleance.citoyen_email} />
          </dl>
        </PrintSection>

        <PrintSection icon={FolderIcon} title="Description du problème">
          <p className="print-text">{valueOrDash(doleance.description)}</p>
          {doleance.suggestions && String(doleance.suggestions).trim() !== '' && (
            <div className="print-suggestion">
              <span>Suggestion du plaignant</span>
              <p className="print-text">{doleance.suggestions}</p>
            </div>
          )}
        </PrintSection>

        <footer className="print-doc-footer">
          <p className="print-doc-footer-motto">DOLEANCE</p>
          <p className="print-doc-footer-meta">
            Imprimé le {formatDateTime(new Date().toISOString())}
          </p>
        </footer>
      </article>
    </div>
  );
}

export default DoleancePrint;
