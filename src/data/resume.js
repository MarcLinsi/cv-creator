// Modèle de données d'un CV. Toutes les templates consomment cette même forme.

export const emptyExperience = {
  poste: '',
  entreprise: '',
  lieu: '',
  debut: '',
  fin: '',
  description: '',
}

export const emptyEducation = {
  diplome: '',
  etablissement: '',
  lieu: '',
  debut: '',
  fin: '',
}

export const emptyCompetence = { nom: '', niveau: 80 }

// Pas de niveau ici, à dessein : noter sa propre « capacité d'écoute » à 85 %
// ne veut rien dire. Les barres restent aux hard skills, où elles en ont un.
export const emptySoftSkill = { nom: '' }

// `items` est une liste séparée par des virgules, comme `description` l'est par
// des retours à la ligne : une seule zone de saisie par catégorie plutôt qu'un
// champ par techno.
export const emptyTechno = { categorie: '', items: '' }

export const emptyLangue = { langue: '', niveau: '' }

export const emptyInfos = {
  prenom: '',
  nom: '',
  titre: '',
  email: '',
  telephone: '',
  ville: '',
  adresse: '',
  dateNaissance: '',
  site: '',
  photo: '',
}

export const emptyResume = {
  infos: { ...emptyInfos },
  resume: '',
  experiences: [],
  formations: [],
  competences: [],
  softSkills: [],
  technos: [],
  langues: [],
}

export const sampleResume = {
  infos: {
    prenom: 'Camille',
    nom: 'Dupont',
    titre: 'Développeuse Web Front-End',
    email: 'camille.dupont@example.com',
    telephone: '079 000 00 00',
    ville: 'Lausanne, Suisse',
    adresse: 'Rue de l\'Exemple 1, Lausanne',
    dateNaissance: '01.01.1990',
    site: '',
    photo: '',
  },
  resume:
    "Responsable du développement chez Exemple SA, je suis à la recherche d'un poste de développeur web front-end pour mettre à contribution mes compétences et mon expertise technique.",
  experiences: [
    {
      poste: 'Responsable du développement - Développeur full-stack',
      entreprise: 'Exemple SA',
      lieu: 'Lausanne',
      debut: '03/2024',
      fin: 'Maintenant',
      description:
        "Réalisation complète d'un outil de back-office de suivi de projets, gestion de ticketing et reporting financier (React, MySQL, Node.js)\nResponsable du parc informatique (350+ sites)\nOptimisation du parc et mise en place d'outils d'analyse et de reporting\nDéveloppement et optimisation d'un thème WordPress propriétaire\nResponsable d'une équipe de développeurs et mise en place de process pour améliorer, planifier et sécuriser nos chantiers de développement\nDéveloppement d'un portail clients pour gérer leurs produits (TailwindCSS, React, Node.js, MySQL)\nCréation d'APIs REST pour communiquer entre les stacks",
    },
    {
      poste: 'Chef de projet technique CRM',
      entreprise: '@ Agence Exemple',
      lieu: 'Lausanne',
      debut: '08/2023',
      fin: '12/2023',
      description:
        "Création de sites internet\nRépondre efficacement aux besoins des clients grâce à Jira\nÉlaboration de stratégies marketing, automatisation des processus de vente via le CRM interne et proposition d'améliorations commerciales fructueuses pour augmenter les ventes.",
    },
    {
      poste: 'Intégrateur web / Webmaster',
      entreprise: '@ Société Exemple',
      lieu: 'Genève',
      debut: '01/2023',
      fin: '08/2023',
      description:
        "Création de sites Internet multilingues avec WordPress (WooCommerce + Elementor et Divi) et Joomla\nCréation de fonctionnalités from scratch (JS/CSS/HTML) pour nos différents sites\nGestion de modules de paiement WordPress (Stripe, TWINT, myPOS, Payments by WooCommerce)\nÉtroite collaboration avec nos équipes Marketing\nRéférencement naturel et collaboration technique avec des agences externes (Google ADS, Analytics et Tag Manager)",
    },
    {
      poste: 'Développeur web',
      entreprise: '@ Freelance',
      lieu: '',
      debut: '10/2018',
      fin: '01/2023',
      description:
        "Création de solutions e-commerce\nRéférencement optimisé sur les moteurs de recherche\nDéveloppement responsif de sites en HTML, PHP, CSS, et frameworks JS (React, Vue et Angular)",
    },
  ],
  formations: [
    {
      diplome: 'Informaticien CFC',
      etablissement: 'École Exemple',
      lieu: 'Lausanne',
      debut: '08/2017',
      fin: '07/2019',
    },
  ],
  competences: [
    { nom: 'HTML/CSS/PHP/JS', niveau: 95 },
    { nom: 'React', niveau: 88 },
    { nom: 'SQL', niveau: 82 },
    { nom: 'WordPress', niveau: 80 },
  ],
  softSkills: [
    { nom: 'Autonomie' },
    { nom: "Travail en équipe" },
    { nom: 'Communication' },
    { nom: 'Rigueur' },
  ],
  technos: [
    { categorie: 'Frontend', items: 'React, Vue, TypeScript, TailwindCSS' },
    { categorie: 'Backend', items: 'Node.js, PHP, MySQL, REST' },
    { categorie: 'Outils', items: 'Git, Docker, Jira, Figma' },
  ],
  langues: [
    { langue: 'Français', niveau: 'Langue maternelle' },
    { langue: 'Anglais', niveau: 'C1' },
    { langue: 'Allemand', niveau: 'B2' },
  ],
}
