export default {
  label: 'English',

  // --- Interface : barre du haut et éditeur ---------------------------------
  ui: {
    tagline: 'resume builder',
    importer: 'Import',
    importerTitre: 'Load a resume from a .json file',
    exporter: 'Export',
    exporterTitre: 'Save the resume to a .json file',
    telechargerPdf: 'Download PDF',
    fermer: 'Dismiss',
    langueSite: 'Site language',
    langueCv: 'Resume language',
    langueCvSuitSite: 'follows site',

    apparence: 'Appearance',
    police: 'Font',
    tailleTexte: 'Text size',
    couleurAccent: 'Accent colour',
    tailles: { compact: 'Compact', normal: 'Normal', grand: 'Large' },
    couleur: (c) => `Colour ${c}`,

    supprimer: 'Remove',
    ajouter: 'Add',

    infosTitre: 'Personal details',
    prenom: 'First name',
    nom: 'Last name',
    titrePoste: 'Job title',
    email: 'Email',
    telephone: 'Phone',
    ville: 'City',
    site: 'Website / LinkedIn',
    adresse: 'Address',
    dateNaissance: 'Date of birth',
    dateNaissancePlaceholder: '01.01.1990',
    photo: 'Photo (optional)',
    retirerPhoto: 'Remove photo',

    resumeTitre: 'Summary',
    presentation: 'Profile',
    presentationPlaceholder: 'A few sentences introducing yourself…',

    experiencesTitre: 'Experience',
    poste: 'Position',
    entreprise: 'Company',
    lieu: 'Location',
    debut: 'From',
    fin: 'To',
    debutPlaceholder: '2022',
    finPlaceholder: 'Present',
    description: 'Description (one line per bullet)',

    formationTitre: 'Education',
    diplome: 'Degree',
    etablissement: 'Institution',

    competencesTitre: 'Skills',
    competence: 'Skill',
    niveauPourcent: (n) => `Level — ${n}%`,

    softSkillsTitre: 'Soft skills',
    softSkill: 'Soft skill',

    technosTitre: 'Technologies',
    categorie: 'Category',
    technosItems: 'Technologies (comma separated)',
    categoriePlaceholder: 'Frontend',
    technosPlaceholder: 'React, Vue, TypeScript',

    languesTitre: 'Languages',
    langue: 'Language',
    niveau: 'Level',
  },

  // --- Contenu du CV : uniquement les libellés non saisissables -------------
  cv: {
    experiences: 'Professional experience',
    formations: 'Education',
    competences: 'Skills',
    langues: 'Languages',
    softSkills: 'Soft skills',
    technologies: 'Technologies',
    profil: 'Profile',
    hardSkills: 'Hard skills',
    suite: '(continued)',
  },
}
