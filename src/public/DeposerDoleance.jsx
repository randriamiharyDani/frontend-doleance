import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';
import { 
  DocumentTextIcon, 
  ClipboardDocumentIcon, 
  ListBulletIcon,
  EyeIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  BoltIcon,
  HomeModernIcon,
  TrashIcon,
  HeartIcon,
  TruckIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  UsersIcon,
  TrophyIcon,
  MusicalNoteIcon,
  ShoppingBagIcon,
  ComputerDesktopIcon,
  QuestionMarkCircleIcon,
  BanknotesIcon,
  MegaphoneIcon,
  CubeIcon,
  SparklesIcon,
  FireIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// ⚠️ IMPORTANT: Utiliser le vrai EmailService
import EmailService from '../services/emailService';

function DeposerDoleance() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [arrondissements, setArrondissements] = useState([]);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [savedReference, setSavedReference] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  const [sendingReference, setSendingReference] = useState(false);
  const [referenceSent, setReferenceSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [selectedCategoryDescription, setSelectedCategoryDescription] = useState('');
  
  const [formData, setFormData] = useState({
    nom_citoyen: '',
    prenom_citoyen: '',
    contact: '',
    adresse_citoyen: '',
    lot: '',
    fokontany: '',
    arrondissement: '',
    titre: '',
    description: '',
    id_categorie: '',
    id_quartier: '',
    lieu_exact: '',
    suggestions: ''
  });
  
  // Catégories complètes avec icônes disponibles - avec noms traduits via t()
  const getCategoriesList = () => {
    return [
      { id: 1, nom: t('categories.administration'), description: t('categories.administrationDesc'), icon: <BuildingOfficeIcon className="h-5 w-5" />, color: 'text-sky-500' },
      { id: 2, nom: t('categories.security'), description: t('categories.securityDesc'), icon: <ShieldCheckIcon className="h-5 w-5" />, color: 'text-red-500' },
      { id: 3, nom: t('categories.infrastructure'), description: t('categories.infrastructureDesc'), icon: <WrenchScrewdriverIcon className="h-5 w-5" />, color: 'text-gray-500' },
      { id: 4, nom: t('categories.education'), description: t('categories.educationDesc'), icon: <AcademicCapIcon className="h-5 w-5" />, color: 'text-indigo-400' },
      { id: 5, nom: t('categories.electricity'), description: t('categories.electricityDesc'), icon: <BoltIcon className="h-5 w-5" />, color: 'text-yellow-500' },
      { id: 6, nom: t('categories.roads'), description: t('categories.roadsDesc'), icon: <HomeModernIcon className="h-5 w-5" />, color: 'text-teal-500' },
      { id: 7, nom: t('categories.water'), description: t('categories.waterDesc'), icon: <CubeIcon className="h-5 w-5" />, color: 'text-cyan-500' },
      { id: 8, nom: t('categories.waste'), description: t('categories.wasteDesc'), icon: <TrashIcon className="h-5 w-5" />, color: 'text-green-500' },
      { id: 9, nom: t('categories.health'), description: t('categories.healthDesc'), icon: <HeartIcon className="h-5 w-5" />, color: 'text-pink-500' },
      { id: 10, nom: t('categories.transport'), description: t('categories.transportDesc'), icon: <TruckIcon className="h-5 w-5" />, color: 'text-purple-500' },
      { id: 11, nom: t('categories.housing'), description: t('categories.housingDesc'), icon: <HomeModernIcon className="h-5 w-5" />, color: 'text-orange-500' },
      { id: 12, nom: t('categories.environment'), description: t('categories.environmentDesc'), icon: <SparklesIcon className="h-5 w-5" />, color: 'text-emerald-500' },
      { id: 13, nom: t('categories.employment'), description: t('categories.employmentDesc'), icon: <BriefcaseIcon className="h-5 w-5" />, color: 'text-slate-500' },
      { id: 14, nom: t('categories.social'), description: t('categories.socialDesc'), icon: <UsersIcon className="h-5 w-5" />, color: 'text-rose-500' },
      { id: 15, nom: t('categories.youth'), description: t('categories.youthDesc'), icon: <TrophyIcon className="h-5 w-5" />, color: 'text-amber-500' },
      { id: 16, nom: t('categories.culture'), description: t('categories.cultureDesc'), icon: <MusicalNoteIcon className="h-5 w-5" />, color: 'text-fuchsia-500' },
      { id: 17, nom: t('categories.agriculture'), description: t('categories.agricultureDesc'), icon: <GlobeAltIcon className="h-5 w-5" />, color: 'text-lime-500' },
      { id: 18, nom: t('categories.commerce'), description: t('categories.commerceDesc'), icon: <BanknotesIcon className="h-5 w-5" />, color: 'text-amber-600' },
      { id: 19, nom: t('categories.communication'), description: t('categories.communicationDesc'), icon: <MegaphoneIcon className="h-5 w-5" />, color: 'text-sky-500' },
      { id: 20, nom: t('categories.emergency'), description: t('categories.emergencyDesc'), icon: <FireIcon className="h-5 w-5" />, color: 'text-red-500' },
      { id: 21, nom: t('categories.other'), description: t('categories.otherDesc'), icon: <QuestionMarkCircleIcon className="h-5 w-5" />, color: 'text-gray-400' }
    ];
  };

  const allCategories = getCategoriesList();
  
  useEffect(() => {
    fetchData();
  }, [t]);
  
  // Mettre à jour la description quand la catégorie change
  useEffect(() => {
    if (formData.id_categorie) {
      const selected = categories.find(cat => 
        (cat.id_categorie === formData.id_categorie) || 
        (cat.id === formData.id_categorie)
      );
      const categoryName = selected?.nom_categorie || selected?.nom;
      const description = selected?.description || getCategoriesList().find(c => c.nom === categoryName)?.description || '';
      setSelectedCategoryDescription(description);
    } else {
      setSelectedCategoryDescription('');
    }
  }, [formData.id_categorie, categories]);
  
  const fetchData = async () => {
    try {
      const [categoriesRes, quartiersRes] = await Promise.all([
        api.get('/doleances/categories'),
        api.get('/doleances/quartiers')
      ]);
      
      let existingCategories = categoriesRes.data?.data || categoriesRes.data || [];
      
      if (existingCategories.length === 0) {
        setCategories(getCategoriesList());
      } else {
        const existingNames = existingCategories.map(c => c.nom_categorie?.toLowerCase());
        const allNewCategories = [...existingCategories];
        
        for (const cat of getCategoriesList()) {
          const exists = existingNames.includes(cat.nom.toLowerCase());
          if (!exists) {
            allNewCategories.push({
              id_categorie: `temp_${cat.id}`,
              nom_categorie: cat.nom,
              description: cat.description,
              icon: cat.icon,
              color: cat.color
            });
          }
        }
        setCategories(allNewCategories);
      }
      
      setQuartiers(quartiersRes.data?.data || quartiersRes.data || []);
      
      // Arrondissements traduits
      setArrondissements([
        t('districts.district1'),
        t('districts.district2'),
        t('districts.district3'),
        t('districts.district4'),
        t('districts.district5'),
        t('districts.district6')
      ]);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error(t('errors.generic'));
      setCategories(getCategoriesList());
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation pour le numéro de téléphone
    if (name === 'contact') {
      const cleanedValue = value.replace(/\s/g, '');
      
      // Vérifier si c'est un numéro de téléphone (commence par un chiffre)
      const isPhone = /^[0-9+\s\-()]/.test(value);
      
      if (isPhone) {
        // Supprimer tout sauf les chiffres, +, -, espaces, parenthèses
        const filtered = value.replace(/[^0-9+\s\-()]/g, '');
        
        // Compter les chiffres
        const digitsOnly = filtered.replace(/[^0-9]/g, '');
        
        if (digitsOnly.length > 10) {
          setPhoneError(t('messages.phoneMaxDigits'));
          // Ne pas mettre à jour la valeur si elle dépasse 10 chiffres
          return;
        } else {
          setPhoneError('');
        }
        
        setFormData({
          ...formData,
          [name]: filtered
        });
      } else {
        // Si c'est un email, pas de limite de chiffres
        setPhoneError('');
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const getContactType = (contact) => {
    if (!contact) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Vérifier si c'est un numéro de téléphone (8-10 chiffres, avec ou sans espaces, +, -)
    const phoneRegex = /^[+\s\-()0-9]{8,15}$/;
    
    // Nettoyer le contact pour compter les chiffres
    const digitsOnly = contact.replace(/[^0-9]/g, '');
    
    if (emailRegex.test(contact)) return 'email';
    if (phoneRegex.test(contact) && digitsOnly.length >= 8 && digitsOnly.length <= 10) return 'phone';
    return 'unknown';
  };
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024;
    const validFiles = [];
    const errors = [];
    
    selectedFiles.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} ${t('messages.fileTooBig')}`);
      } else if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        errors.push(`${file.name} ${t('messages.invalidFileType')}`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }
    
    if (validFiles.length + files.length > 5) {
      toast.error(t('messages.maxFilesReached'));
      return;
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };
  
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-sky-500" />;
    } else if (file.type.startsWith('video/')) {
      return <VideoCameraIcon className="h-8 w-8 text-purple-500" />;
    }
    return <DocumentDuplicateIcon className="h-8 w-8 text-gray-500" />;
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const uploadFiles = async (doleanceId) => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const formDataFiles = new FormData();
    files.forEach(file => {
      formDataFiles.append('files', file);
    });
    formDataFiles.append('doleance_id', doleanceId);
    
    try {
      const response = await api.post('/doleances/upload', formDataFiles, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      
      if (response.data.success) {
        toast.success(`${files.length} fichier(s) uploadé(s) avec succès`);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(t('errors.generic'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('messages.referenceCopied'));
    } catch (err) {
      console.error('Erreur de copie:', err);
      toast.error(t('errors.generic'));
    }
  };
  
  // Fonction pour envoyer automatiquement la référence par email
  const sendReferenceAuto = async (reference, contact, contactType, nom, prenom, titre) => {
    if (!contact || !reference) {
      console.log('❌ Contact ou référence manquant');
      return;
    }
    
    console.log('📤 Envoi de la référence:', { reference, contact, contactType });
    
    setSendingReference(true);
    setSendError(null);
    setEmailSent(false);
    setSmsSent(false);
    
    try {
      // Utiliser le vrai EmailService
      const result = await EmailService.sendReference(
        contact,
        reference,
        nom || 'Citoyen',
        prenom || '',
        titre || 'Doléance'
      );
      
      console.log('📬 Résultat de l\'envoi:', result);
      
      if (result.success) {
        if (contactType === 'email') {
          setEmailSent(true);
        } else {
          setSmsSent(true);
        }
        setReferenceSent(true);
        
        toast.success(
          (toastId) => (
            <div className="flex flex-col gap-1">
              <div className="font-bold flex items-center gap-2">
                <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                ✅ {t('messages.referenceSent')}
              </div>
              <div className="text-sm flex items-center gap-1">
                {contactType === 'email' ? <EnvelopeIcon className="h-4 w-4" /> : <DevicePhoneMobileIcon className="h-4 w-4" />}
                {contact}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                📋 Référence: {reference}
              </div>
            </div>
          ),
          { duration: 8000 }
        );
      } else {
        setSendError(result.message);
        toast.error(
          (toastId) => (
            <div className="flex flex-col gap-1">
              <div className="font-bold flex items-center gap-2 text-red-500">
                <ExclamationTriangleIcon className="h-5 w-5" />
                ❌ {t('messages.emailSendError')}
              </div>
              <div className="text-xs text-gray-500">
                {result.message}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                📋 Référence: {reference}
              </div>
            </div>
          ),
          { duration: 8000 }
        );
      }
    } catch (error) {
      console.error('❌ Erreur envoi référence:', error);
      setSendError(error.message || 'Erreur inconnue');
      toast.error(
        (toastId) => (
          <div className="flex flex-col gap-1">
            <div className="font-bold flex items-center gap-2 text-red-500">
              <ExclamationTriangleIcon className="h-5 w-5" />
              ❌ {t('messages.emailSendError')}
            </div>
            <div className="text-xs text-gray-500">
              {error.message || t('errors.generic')}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              📋 Référence: {reference}
            </div>
          </div>
        ),
        { duration: 8000 }
      );
    } finally {
      setSendingReference(false);
    }
  };
  
  const getCategoryIcon = (categoryName) => {
    const cat = getCategoriesList().find(c => c.nom === categoryName);
    return cat?.icon || <QuestionMarkCircleIcon className="h-5 w-5" />;
  };
  
  const getCategoryColor = (categoryName) => {
    const cat = getCategoriesList().find(c => c.nom === categoryName);
    return cat?.color || 'text-gray-400';
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation du contact
    const contactType = getContactType(formData.contact);
    if (!formData.contact) {
      toast.error(t('form.emailOrPhone'));
      return;
    }
    
    if (contactType === 'unknown') {
      toast.error(t('messages.invalidFormat'));
      return;
    }
    
    if (contactType === 'phone') {
      const digitsOnly = formData.contact.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 8 || digitsOnly.length > 10) {
        toast.error(t('messages.phoneLengthError'));
        return;
      }
    }
    
    if (!formData.nom_citoyen || !formData.prenom_citoyen || !formData.titre || !formData.description || !formData.id_categorie) {
      toast.error(t('messages.pleaseFillRequired'));
      return;
    }
    
    setLoading(true);
    
    try {
      const adresseComplete = `${formData.adresse_citoyen || ''}${formData.lot ? `, Lot ${formData.lot}` : ''}${formData.fokontany ? `, Fokontany ${formData.fokontany}` : ''}${formData.arrondissement ? `, ${formData.arrondissement}` : ''}`;
      
      const dataToSend = {
        ...formData,
        adresse_citoyen: adresseComplete,
        telephone_citoyen: contactType === 'phone' ? formData.contact.replace(/\s/g, '') : null,
        email_citoyen: contactType === 'email' ? formData.contact : null,
        description: `${formData.description}\n\nLieu exact: ${formData.lieu_exact || 'Non précisé'}\nSuggestions: ${formData.suggestions || 'Aucune suggestion'}`
      };
      
      if (typeof dataToSend.id_categorie === 'string' && dataToSend.id_categorie.includes('temp_')) {
        const selectedCategory = categories.find(cat => cat.id_categorie === dataToSend.id_categorie);
        dataToSend.categorie_nom = selectedCategory?.nom_categorie;
        delete dataToSend.id_categorie;
      }
      
      const response = await api.post('/doleances', dataToSend);
      const reference = response.data.data?.reference || response.data.reference;
      const doleanceId = response.data.data?.id_doleance || response.data.id_doleance;
      
      if (files.length > 0 && doleanceId) {
        await uploadFiles(doleanceId);
      }
      
      setSavedReference(reference);
      
      // Envoyer automatiquement la référence par email ou SMS
      if (formData.contact && reference) {
        await sendReferenceAuto(
          reference, 
          formData.contact, 
          contactType,
          formData.nom_citoyen,
          formData.prenom_citoyen,
          formData.titre
        );
      }
      
      // Notification de succès avec la référence
      toast.success(
        (toastId) => (
          <div className="flex flex-col gap-2">
            <div className="font-bold flex items-center gap-2">
              <CheckBadgeIcon className="h-5 w-5 text-green-500" />
              ✅ {t('messages.submissionSuccess')}
            </div>
            <div className="text-sm">
              {t('messages.yourReference')} : <span className="font-mono font-bold text-sky-600">{reference}</span>
            </div>
            {emailSent && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <EnvelopeIcon className="h-4 w-4" />
                {t('messages.referenceSentTo')} {formData.contact}
              </div>
            )}
            {smsSent && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <DevicePhoneMobileIcon className="h-4 w-4" />
                {t('messages.referenceSentTo')} {formData.contact}
              </div>
            )}
            {sendError && !emailSent && !smsSent && (
              <div className="text-xs text-orange-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {t('messages.referenceNotSent')}
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  copyToClipboard(reference);
                  toast.dismiss(toastId);
                }}
                className="text-xs bg-sky-500 text-white px-2 py-1 rounded hover:bg-sky-600"
              >
                {t('form.copy')}
              </button>
              <button
                onClick={() => {
                  navigate(`/suivi-doleance/${reference}`);
                  toast.dismiss(toastId);
                }}
                className="text-xs bg-sky-500 text-white px-2 py-1 rounded hover:bg-sky-600"
              >
                {t('form.track')}
              </button>
            </div>
          </div>
        ),
        { duration: 10000 }
      );
      
      setShowReferenceModal(true);
      
      setTimeout(() => {
        if (showReferenceModal) {
          setShowReferenceModal(false);
          navigate(`/suivi-doleance/${reference}`);
        }
      }, 5000);
      
      setFormData({
        nom_citoyen: '',
        prenom_citoyen: '',
        contact: '',
        adresse_citoyen: '',
        lot: '',
        fokontany: '',
        arrondissement: '',
        titre: '',
        description: '',
        id_categorie: '',
        id_quartier: '',
        lieu_exact: '',
        suggestions: ''
      });
      setFiles([]);
      setReferenceSent(false);
      setEmailSent(false);
      setSmsSent(false);
      setSendError(null);
      setSelectedCategoryDescription('');
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseModal = () => {
    setShowReferenceModal(false);
    if (savedReference) {
      navigate(`/suivi-doleance/${savedReference}`);
    }
  };
  
  const handleCopyAndContinue = () => {
    copyToClipboard(savedReference);
  };
  
  // Fonction pour renvoyer la référence manuellement
  const sendReferenceManually = async () => {
    if (!formData.contact || !savedReference) {
      toast.error(t('messages.noContactOrReference'));
      return;
    }
    
    const contactType = getContactType(formData.contact);
    await sendReferenceAuto(
      savedReference,
      formData.contact,
      contactType,
      formData.nom_citoyen || 'Citoyen',
      formData.prenom_citoyen || '',
      formData.titre || 'Doléance'
    );
  };

  const contactType = getContactType(formData.contact);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-blue-100'
    }`}>
      <PublicNavbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8 pt-4">
          <div className={`inline-block p-4 rounded-2xl shadow-xl mb-4 transform hover:scale-105 transition-transform duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-sky-500 to-blue-600'
          }`}>
            <DocumentTextIcon className={`h-14 w-14 ${darkMode ? 'text-sky-400' : 'text-white'}`} />
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-sky-400' : 'text-sky-800'}`}>
            {t('nav.submit')}
          </h1>
          <p className={darkMode ? 'text-gray-300' : 'text-sky-600'}>
            {t('hero.subtitle')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={`rounded-2xl shadow-2xl p-6 md:p-8 border-2 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-sky-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section Vos informations */}
            <div className="md:col-span-2">
              <h2 className={`text-xl font-bold mb-4 pb-2 border-b-2 flex items-center gap-2 ${
                darkMode 
                  ? 'text-gray-200 border-gray-700' 
                  : 'text-sky-700 border-sky-200'
              }`}>
                <UserIcon className={`h-6 w-6 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                {t('form.yourInfo')}
              </h2>
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.lastName')} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="nom_citoyen" 
                value={formData.nom_citoyen} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder={t('form.lastName')}
                required 
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.firstName')} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="prenom_citoyen" 
                value={formData.prenom_citoyen} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder={t('form.firstName')}
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <DevicePhoneMobileIcon className={`h-4 w-4 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                {t('form.emailOrPhone')} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="contact" 
                value={formData.contact} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  phoneError 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                      : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder="exemple@email.com ou 0341234567"
                required
              />
              {phoneError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠️</span> {phoneError}
                </p>
              )}
              {formData.contact && !phoneError && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${darkMode ? 'text-gray-400' : ''}`}>
                  {contactType === 'email' ? (
                    <span className="text-green-600">📧 {t('messages.emailFormat')}</span>
                  ) : contactType === 'phone' ? (
                    <span className="text-sky-600">📱 {t('messages.phoneFormat')} ({formData.contact.replace(/[^0-9]/g, '').length} chiffres)</span>
                  ) : (
                    <span className="text-orange-600">⚠️ {t('messages.invalidFormat')}</span>
                  )}
                </p>
              )}
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('form.emailOrPhone')}
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <MapPinIcon className={`h-4 w-4 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                {t('form.address')} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="adresse_citoyen" 
                value={formData.adresse_citoyen} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder="Lot II M... Ankatso"
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.lot')}
              </label>
              <input 
                type="text" 
                name="lot" 
                value={formData.lot} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder="Lot II M 123"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.fokontany')} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="fokontany" 
                value={formData.fokontany} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder="Ex: Ambohidahy, Analakely, Isotry..."
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.district')}
              </label>
              <select
                name="arrondissement"
                value={formData.arrondissement}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
              >
                <option value="">{t('form.selectDistrict')}</option>
                {arrondissements.map(arr => (
                  <option key={arr} value={arr}>{arr}</option>
                ))}
              </select>
            </div>
            
            {/* Section Détails de la doléance */}
            <div className="md:col-span-2">
              <h2 className={`text-xl font-bold mb-4 pb-2 border-b-2 flex items-center gap-2 ${
                darkMode 
                  ? 'text-gray-200 border-gray-700' 
                  : 'text-sky-700 border-sky-200'
              }`}>
                <DocumentTextIcon className={`h-6 w-6 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                {t('form.details')}
              </h2>
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.title')} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="titre" 
                value={formData.titre} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder={t('form.titlePlaceholder')}
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.description')} <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                rows="6" 
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder={t('form.descriptionPlaceholder')}
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.exactLocation')}
              </label>
              <input 
                type="text" 
                name="lieu_exact" 
                value={formData.lieu_exact} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder={t('form.exactLocationPlaceholder')}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.suggestions')}
              </label>
              <textarea 
                name="suggestions" 
                value={formData.suggestions} 
                onChange={handleChange}
                rows="3" 
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                placeholder={t('form.suggestionsPlaceholder')}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <TagIcon className={`h-4 w-4 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                {t('form.category')} <span className="text-red-500">*</span>
              </label>
              <select 
                name="id_categorie" 
                value={formData.id_categorie} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
                required
              >
                <option value="">{t('form.selectCategory')}</option>
                {categories.map(cat => {
                  const categoryName = cat.nom_categorie || cat.nom;
                  return (
                    <option key={cat.id_categorie || cat.id} value={cat.id_categorie || cat.id}>
                      {categoryName}
                    </option>
                  );
                })}
              </select>
              {formData.id_categorie && (
                <div className={`mt-2 p-3 rounded-lg border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {(() => {
                      const selected = categories.find(cat => 
                        (cat.id_categorie === formData.id_categorie) || 
                        (cat.id === formData.id_categorie)
                      );
                      const categoryName = selected?.nom_categorie || selected?.nom;
                      const icon = getCategoryIcon(categoryName);
                      const color = getCategoryColor(categoryName);
                      return (
                        <div className={`${color} flex-shrink-0 mt-0.5`}>
                          {icon}
                        </div>
                      );
                    })()}
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {(() => {
                          const selected = categories.find(cat => 
                            (cat.id_categorie === formData.id_categorie) || 
                            (cat.id === formData.id_categorie)
                          );
                          return selected?.nom_categorie || selected?.nom || '';
                        })()}
                      </p>
                      {selectedCategoryDescription && (
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedCategoryDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.neighborhood')}
              </label>
              <select 
                name="id_quartier" 
                value={formData.id_quartier} 
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-400 focus:ring-sky-400/20' 
                    : 'bg-white border-gray-200 focus:border-sky-400 focus:ring-sky-200'
                }`}
              >
                <option value="">{t('form.selectNeighborhood')}</option>
                {quartiers.map(quartier => (
                  <option key={quartier.id_quartier} value={quartier.id_quartier}>
                    {quartier.nom_quartier}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Pièces jointes */}
            <div className="md:col-span-2">
              <h2 className={`text-xl font-bold mb-4 pb-2 border-b-2 flex items-center gap-2 ${
                darkMode 
                  ? 'text-gray-200 border-gray-700' 
                  : 'text-sky-700 border-sky-200'
              }`}>
                <PhotoIcon className={`h-6 w-6 ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                {t('form.attachments')}
              </h2>
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('form.attachmentsDescription')}
              </p>
              
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                darkMode 
                  ? 'border-gray-600 hover:bg-gray-700/50' 
                  : 'border-sky-300 hover:bg-sky-50'
              }`}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-sky-600 hover:bg-sky-700 text-white' 
                      : 'bg-sky-500 text-white hover:bg-sky-600'
                  }`}
                >
                  <PhotoIcon className="h-5 w-5" />
                  {t('form.chooseFiles')}
                </label>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('form.fileFormats')}
                </p>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {files.length} fichier(s) sélectionné(s)
                  </p>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {files.map((file, index) => (
                      <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          {getFileIcon(file)}
                          <div>
                            <p className={`text-sm font-medium truncate max-w-xs ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              {file.name}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{uploadProgress}%</span>
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    {t('messages.uploading')}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button 
              type="submit" 
              disabled={loading || uploading || !!phoneError}
              className={`group relative px-8 py-4 font-bold rounded-xl disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 text-lg ${
                darkMode 
                  ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white' 
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500'
              }`}
            >
              {loading || uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploading ? t('messages.uploading') : t('messages.sending')}
                </span>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  {t('form.submit')}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
      
      {/* Modal de confirmation avec statut d'envoi */}
      {showReferenceModal && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
          darkMode ? 'bg-black/80' : 'bg-sky-900/80'
        }`}>
          <div className={`relative rounded-2xl shadow-xl max-w-md w-full mx-auto p-6 border-2 transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-sky-300'
          }`}>
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                darkMode 
                  ? 'bg-gradient-to-br from-sky-600 to-blue-700' 
                  : 'bg-gradient-to-br from-sky-500 to-blue-600'
              }`}>
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('messages.submissionSuccess')}
              </h3>
              
              {/* Statut d'envoi de la référence */}
              <div className="mb-3">
                {emailSent && (
                  <div className={`p-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-green-900/30 border-green-700' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className={`text-sm flex items-center justify-center gap-2 ${
                      darkMode ? 'text-green-400' : 'text-green-700'
                    }`}>
                      <CheckBadgeIcon className="h-5 w-5" />
                      <EnvelopeIcon className="h-4 w-4" />
                      {t('messages.referenceSentTo')} {formData.contact}
                    </p>
                  </div>
                )}
                {smsSent && (
                  <div className={`p-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-green-900/30 border-green-700' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className={`text-sm flex items-center justify-center gap-2 ${
                      darkMode ? 'text-green-400' : 'text-green-700'
                    }`}>
                      <CheckBadgeIcon className="h-5 w-5" />
                      <DevicePhoneMobileIcon className="h-4 w-4" />
                      {t('messages.referenceSentTo')} {formData.contact}
                    </p>
                  </div>
                )}
                {sendError && !emailSent && !smsSent && (
                  <div className={`p-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-orange-900/30 border-orange-700' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <p className={`text-sm flex items-center justify-center gap-2 ${
                      darkMode ? 'text-orange-400' : 'text-orange-700'
                    }`}>
                      <ExclamationTriangleIcon className="h-5 w-5" />
                      {t('messages.referenceNotSent')}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                      {sendError}
                    </p>
                  </div>
                )}
                {!emailSent && !smsSent && !sendError && sendingReference && (
                  <div className={`p-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-blue-900/30 border-blue-700' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={`text-sm flex items-center justify-center gap-2 ${
                      darkMode ? 'text-blue-400' : 'text-blue-700'
                    }`}>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('messages.sending')}...
                    </p>
                  </div>
                )}
              </div>
              
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('messages.keepReference')}
              </p>
              <div className={`rounded-lg p-3 mb-4 border-2 transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-sky-50 border-sky-200'
              }`}>
                <code className={`text-lg font-mono font-bold break-all ${
                  darkMode ? 'text-sky-400' : 'text-sky-600'
                }`}>
                  {savedReference}
                </code>
              </div>
              <p className={`text-xs mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('messages.keepReference')}
              </p>
              
              {/* Bouton Renvoyer si l'envoi a échoué */}
              {!emailSent && !smsSent && sendError && formData.contact && (
                <button
                  onClick={sendReferenceManually}
                  disabled={sendingReference}
                  className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors w-full mb-2 disabled:opacity-50"
                >
                  {sendingReference ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('messages.sending')}
                    </>
                  ) : (
                    <>
                      {contactType === 'email' ? (
                        <EnvelopeIcon className="h-4 w-4" />
                      ) : (
                        <DevicePhoneMobileIcon className="h-4 w-4" />
                      )}
                      {t('messages.referenceSent')} {contactType === 'email' ? 'email' : 'SMS'}
                    </>
                  )}
                </button>
              )}
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopyAndContinue}
                  className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  {t('form.copy')}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="inline-flex justify-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-lg hover:from-sky-600 hover:to-blue-700 transition-colors"
                >
                  <EyeIcon className="h-4 w-4" />
                  {t('form.track')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <PublicFooter />
    </div>
  );
}

export default DeposerDoleance;