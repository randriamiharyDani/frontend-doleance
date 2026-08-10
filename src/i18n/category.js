// Helper de traduction des catégories de doléances.
// Les catégories sont stockées en base sous leur libellé français (nom_categorie).
// On les traduit via le bloc `doleanceCategories` des locales (fr/mg/en).
// Les catégories personnalisées inconnues retombent sur le libellé brut.
export const translateCategory = (categorie, t) => {
  if (!categorie) return t('allComplaints.uncategorized');
  return t(`doleanceCategories.${categorie}`, { defaultValue: categorie });
};
