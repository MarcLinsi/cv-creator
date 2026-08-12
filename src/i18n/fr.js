export default {
  // Libellé de cette langue, affiché dans les sélecteurs — toujours dans la
  // langue elle-même, pour rester reconnaissable quelle que soit la langue
  // active de l'interface.
  label: 'Français',

  // --- Interface : barre du haut et éditeur ---------------------------------
  ui: {
    tagline: 'générateur de CV',
    importer: 'Importer',
    importerTitre: 'Charger un CV depuis un fichier .json',
    exporter: 'Exporter',
    exporterTitre: 'Enregistrer le CV dans un fichier .json',
    telechargerPdf: 'Télécharger le PDF',
    fermer: 'Fermer',
    langueSite: 'Langue du site',
    langueCv: 'Langue du CV',
    langueCvSuitSite: 'suit le site',

    apparence: 'Apparence',
    police: 'Police',
    tailleTexte: 'Taille du texte',
    couleurAccent: "Couleur d'accent",
    tailles: { compact: 'Compact', normal: 'Normal', grand: 'Grand' },
    couleur: (c) => `Couleur ${c}`,

    supprimer: 'Supprimer',
    ajouter: 'Ajouter',

    infosTitre: 'Informations personnelles',
    prenom: 'Prénom',
    nom: 'Nom',
    titrePoste: 'Titre / Poste',
    email: 'Email',
    telephone: 'Téléphone',
    ville: 'Ville',
    site: 'Site / LinkedIn',
    adresse: 'Adresse',
    dateNaissance: 'Date de naissance',
    dateNaissancePlaceholder: '01.01.1990',
    photo: 'Photo (optionnel)',
    retirerPhoto: 'Retirer la photo',

    resumeTitre: 'Résumé',
    presentation: 'Présentation',
    presentationPlaceholder: 'Quelques phrases qui vous présentent…',

    experiencesTitre: 'Expériences',
    poste: 'Poste',
    entreprise: 'Entreprise',
    lieu: 'Lieu',
    debut: 'Début',
    fin: 'Fin',
    debutPlaceholder: '2022',
    finPlaceholder: 'Présent',
    description: 'Description (une ligne par point)',

    formationTitre: 'Formation',
    diplome: 'Diplôme',
    etablissement: 'Établissement',

    competencesTitre: 'Compétences',
    competence: 'Compétence',
    niveauPourcent: (n) => `Niveau — ${n}%`,

    softSkillsTitre: 'Soft skills',
    softSkill: 'Soft skill',

    technosTitre: 'Technologies',
    categorie: 'Catégorie',
    technosItems: 'Technos (séparées par des virgules)',
    categoriePlaceholder: 'Frontend',
    technosPlaceholder: 'React, Vue, TypeScript',

    languesTitre: 'Langues',
    langue: 'Langue',
    niveau: 'Niveau',
  },

  // --- Contenu du CV : uniquement les libellés non saisissables -------------
  cv: {
    experiences: 'Expériences professionnelles',
    formations: 'Formation',
    competences: 'Compétences',
    langues: 'Langues',
    softSkills: 'Soft skills',
    technologies: 'Technologies',
    profil: 'Profil',
    hardSkills: 'Hard skills',
    suite: '(suite)',
  },
}
