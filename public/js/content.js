// ============================================================================
//  ALL EDITABLE COPY LIVES HERE.
//
//  This is the only file you need to edit to change any text on the site.
//  Find the language, find the section, change the text between the quotes.
//  Leave the quotes, the comma and the structure alone.
//
//  Text may include {placeholders}, e.g. {count} — they are replaced at runtime.
//  Do not use HTML tags: everything here is inserted as plain text for safety.
// ============================================================================

window.AM = window.AM || {};

AM.CONTENT = {
  fr: {
    meta: {
      title: 'AmiScoot Reims — Location de Scooter PMR et de fauteuils roulants',
      description: 'Louez un Scooter PMR ou un fauteuil roulant à Reims. Livraison possible dans un rayon de 15 km autour de Reims. Réservation en ligne et paiement sécurisé.'
    },

    brand: { name: 'AmiScoot', tagline: 'Location à Reims' },

    hero: {
      title: 'Louez un Scooter PMR ou un fauteuil roulant à Reims',
      subtitle: 'Rapide, simple, fiable. Livraison possible dans un rayon de 15 km autour de Reims.'
    },

    category: {
      label: 'Catégorie',
      scooter: 'Scooter PMR',
      wheelchair: 'Fauteuil roulant'
    },

    filters: {
      title: 'Filtres',
      advanced: 'Filtres avancés',
      open: 'Filtres',
      close: 'Fermer',
      autonomie: 'Autonomie',
      autonomieHint: 'Cochez pour une autonomie minimale',
      autonomieUpTo: 'Jusqu\'à {km} km',
      poids: 'Poids max.',
      pliant: 'Pliant',
      reset: 'Réinitialiser',
      activeCount: '{count} filtre(s)'
    },

    sort: {
      label: 'Trier',
      price_asc: 'Prix croissant',
      price_desc: 'Prix décroissant'
    },

    catalog: {
      count: { one: '{count} véhicule disponible', other: '{count} véhicules disponibles' },
      empty: 'Aucun véhicule ne correspond à ces filtres.',
      emptyHint: 'Essayez d’élargir votre sélection.',
      inactive: 'Indisponible',
      perHour: '/ heure',
      autonomie: 'Autonomie',
      poids: 'Poids max.',
      pliant: 'Pliant',
      imageAlt: '{name}'
    },

    pages: {
      backHome: 'Retour à l\'accueil',
      lastUpdated: 'Dernière mise à jour : {date}',
      draftNotice: 'Cette page est en cours de rédaction. Les informations définitives seront publiées avant la mise en service du service de réservation.',
      todo: 'À compléter',
      readMore: 'Lire la suite'
    },

    faq: {
      title: 'Questions fréquentes',
      seoDescription: 'Réponses aux questions fréquentes sur la location d’un Scooter PMR ou d’un fauteuil roulant à Reims : permis, caution, délais, livraison et paiement.',
      intro: 'Les réponses aux questions les plus courantes sur la location de Scooter PMR et de fauteuils roulants à Reims.',
      items: [
        { q: 'Faut-il un permis pour louer un Scooter PMR ?', a: 'Non. Aucune pièce justificative ni permis n’est demandé pour la location d’un Scooter PMR ou d’un fauteuil roulant. Une pièce d’identité est demandée au dépôt de la caution.' },
        { q: 'Quelle est la caution et quand est-elle rendue ?', a: 'La caution varie selon le modèle et est indiquée sur chaque fiche produit. Elle est débitée lors du paiement et libérée après le retour du matériel, une fois celui-ci contrôlé.' },
        { q: 'Quelles sont les durées de location ?', a: 'La durée minimum est de 2 heures. Vous choisissez la date et l’heure de début et de fin ; le prix total est calculé automatiquement.' },
        { q: 'Livrez-vous en dehors de Reims ?', a: 'Oui, dans un rayon de 15 km autour de Reims. La livraison est gratuite dans un rayon de 5 km et facturée 50 € au-delà, jusqu\'à 15 km.' },
        { q: 'Comment fonctionne le paiement ?', a: 'Le paiement se fait en ligne par carte bancaire via un service sécurisé. Aucune donnée de carte n’est conservée par ce site.' },
        { q: 'Puis-je annuler ma réservation ?', a: 'Oui. La politique d’annulation détaillée figure dans les Conditions Générales de Vente, accessibles depuis le pied de page.' },
        { q: 'Le matériel est-il assuré ?', a: 'Oui, chaque équipement est couvert. Les modalités de franchise sont précisées dans les Conditions Générales de Vente.' },
        { q: 'Proposez-vous des tarifs longue durée ?', a: 'Oui, pour les locations de plusieurs jours. Contactez-nous par téléphone ou WhatsApp au +33 4 12 13 61 41 pour un devis.' }
      ],
      stillStuck: 'Vous ne trouvez pas votre réponse ?'
    },

    cgv: {
      title: 'Conditions Générales de Vente',
      seoDescription: 'Conditions générales de vente d’AmiScoot : réservation, paiement, caution, livraison, annulation et responsabilité.',
      intro: 'Les présentes conditions régissent la location de Scooter PMR et de fauteuils roulants proposés par AmiScoot. Elles s\'appliquent à toute réservation effectuée sur ce site.',
      sections: [
        { h: 'Article 1 — Identification du prestataire', p: [
          'Le prestataire est AmiScoot, dont le siège social est situé 180 Rue de Vesle, 51100 Reims, immatriculée au RCS de Reims sous le numéro SIREN 994 251 882.',
          'Contact : info@amiscoot.fr — +33 4 12 13 61 41.'
        ] },
        { h: 'Article 2 — Objet et description du service', p: [
          'Le service porte sur la location de courte durée de Scooter PMR et de fauteuils roulants, avec ou sans livraison à domicile dans un rayon de 15 km autour de Reims.',
          'Chaque fiche produit indique le tarif horaire, la caution, l\'autonomie, le poids maximum supporté et les caractéristiques techniques du matériel.'
        ] },
        { h: 'Article 3 — Réservation et paiement', p: [
          'Toute réservation est définitive après paiement en ligne par carte bancaire via un prestataire de paiement sécurisé. Ce site ne stocke aucune donnée de carte.',
          'Les prix sont exprimés en euros, toutes taxes comprises. Le prix total comprend le tarif de location, le cas échéant les frais de livraison et la caution.'
        ] },
        { h: 'Article 4 — Durée minimum et annulation', p: ['À COMPLÉTER : délai d\'annulation gratuit, frais d\'annulation, remboursement partiel ou intégral.'] },
        { h: 'Article 5 — Caution', p: [
          'Une caution est débitée lors du paiement. Son montant figure sur chaque fiche produit. Elle est restituée après le retour du matériel et contrôle contradictoire.',
          'À COMPLÉTER : délai de restitution de la caution après retour.'
        ] },
        { h: 'Article 6 — Livraison et retrait', p: [
          'La livraison est gratuite dans un rayon de 5 km autour de Reims et facturée 50 € au-delà, dans la limite de 15 km. Au-delà, la livraison n\'est pas proposée.',
          'À COMPLÉTER : créneaux horaires de livraison et de retrait en magasin.'
        ] },
        { h: 'Article 7 — Matériel, sécurité et Sinne de responsabilité', p: ['À COMPLÉTER : état du matériel à la remise, obligations de l\'utilisateur, limitations de responsabilité.'] },
        { h: 'Article 8 — Assurance', p: ['À COMPLÉTER : assureur, numéro de contrat, franchise et plafond de remboursement.'] },
        { h: 'Article 9 — Données personnelles', p: ['Les données collectées sont traitées conformément à la politique de confidentialité, accessible depuis le pied de page.'] },
        { h: 'Article 10 — Droit applicable et litiges', p: ['À COMPLÉTER : droit applicable, juridiction compétente, mention de médiation de la consommation.'] }
      ]
    },

    privacy: {
      title: 'Politique de confidentialité',
      seoDescription: 'Données personnelles collectées par AmiScoot, finalités, durée de conservation, destinataires et droits des utilisateurs.',
      intro: 'Cette page explique quelles données personnelles sont collectées, pourquoi, combien de temps elles sont conservées et quels sont vos droits.',
      sections: [
        { h: 'Responsable du traitement', p: [
          'AmiScoot, 180 Rue de Vesle, 51100 Reims. Contact pour toute question relative aux données personnelles : info@amiscoot.fr.'
        ] },
        { h: 'Données collectées', p: [
          'Pour traiter une réservation, nous collectons : votre nom, votre adresse e-mail, votre numéro de téléphone et, en cas de livraison, l\'adresse de livraison ainsi que ses coordonnées géographiques.',
          'Aucune donnée de carte bancaire n\'est collectée : le paiement est effectué par un prestataire de paiement sécurisé.'
        ] },
        { h: 'Finalités et base légale', p: [
          'Ces données sont utilisées exclusivement pour traiter votre réservation, organiser la livraison, vous contacter au sujet de celle-ci, et établir les pièces comptables et fiscales obligatoires.',
          'Base légale : exécution du contrat conclu avec vous, et obligation légale pour les données comptables et fiscales.'
        ] },
        { h: 'Durée de conservation', p: [
          'À COMPLÉTER : durées de conservation applicables aux données de réservation, de facturation et de contact.'
        ] },
        { h: 'Destinataires', p: [
          'Vos données ne sont ni vendues ni cédées à des tiers à des fins commerciales. Elles peuvent être communiquées aux prestataires techniques nécessaires à l\'exécution du service (hébergeur, prestataire de paiement, outil de gestion des réservations).',
          'À COMPLÉTER : nom des sous-traitants effectivement utilisés.'
        ] },
        { h: 'Vos droits', p: [
          'Vous disposez d\'un droit d\'accès, de rectification, d\'effacement, de limitation, d\'opposition et de portabilité de vos données, ainsi que du droit de définir des directives relatives à leur sort après votre décès.',
          'Vous pouvez également introduire une réclamation auprès de la Commission nationale de l\'informatique et des libertés (CNIL), 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ou sur www.cnil.fr.'
        ] },
        { h: 'Cookies', p: [
          'Ce site ne dépose aucun cookie publicitaire ni traceur tiers. Seule la préférence de langue (français ou anglais) est enregistrée localement dans votre navigateur, et non sur nos serveurs.'
        ] }
      ]
    },

    legal: {
      title: 'Mentions Légales',
      seoDescription: 'Mentions légales du site AmiScoot : éditeur, SIREN, SIRET, adresse, hébergeur et directeur de la publication.',
      intro: 'Informations légales relatives à l\'exploitation de ce site.',
      sections: [
        { h: 'Éditeur du site', p: [
          'AmiScoot',
          'SIREN : 994 251 882',
          'SIRET (siège) : 99425188200019',
          'Adresse : 180 Rue de Vesle, 51100 Reims, France',
          'Téléphone : +33 4 12 13 61 41',
          'Courriel : info@amiscoot.fr'
        ] },
        { h: 'Directeur de la publication', p: ['À COMPLÉTER : nom du représentant légal.'] },
        { h: 'Hébergeur du site', p: [
          'CloudFlare, Inc.',
          'À COMPLÉTER : adresse postale et numéro de téléphone de l\'hébergeur, tels qu\'figurant dans les conditions générales de Cloudflare applicables.'
        ] },
        { h: 'Propriété intellectuelle', p: [
          'L\'ensemble des contenus présents sur ce site (textes, visuels, marques, code source) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, est interdite sans autorisation écrite préalable.'
        ] },
        { h: 'Responsabilité', p: [
          'AmiScoot met tout en œuvre pour assurer l\'exactitude et la disponibilité des informations publiées. Toutefois, les caractéristiques techniques et la disponibilité du matériel peuvent évoluer ; seule la fiche produit affichée au moment de la réservation fait foi.'
        ] },
        { h: 'Médiation de la consommation', p: [
          'À COMPLÉTER : nom et coordonnées du médiateur de la consommation retenu, le cas échéant.'
        ] }
      ]
    },

    booking: {
      open: 'Réserver',
      title: 'Réserver ce véhicule',
      close: 'Fermer',
      vehicle: 'Véhicule',
      perHour: '{price} / heure',
      period: 'Période',
      from: 'Début',
      to: 'Fin',
      duration: 'Durée',
      durationValue: '{hours} h',
      minHours: 'Durée minimum : {hours} h',
      maxDuration: 'Durée maximum : {days} jours',
      endAfterStart: 'L’heure de fin doit être postérieure à l’heure de début.',
      endRequired: 'Indiquez l’heure de fin.',
      startInPast: 'L’heure de début est déjà passée.',
      endInPast: 'L’heure de fin est déjà passée.',
      mode: 'Mise à disposition',
      pickup: 'Retrait à l’agence',
      delivery: 'Livraison à domicile',
      deliveryRadius: 'Dans un rayon de {max} km autour de Reims',
      storeAddress: '180 Rue de Vesle, 51100 Reims',
      deliveryAddress: 'Adresse de livraison',
      addressHint: 'Saisissez votre ville ou votre code postal, puis choisissez dans la liste. Pour une adresse précise, sélectionnez d’abord la commune.',
      addressResults: 'Adresses proposées',
      outsideRadius: 'Hors zone de livraison ({max} km autour de Reims).',
      withinRadius: 'À {km} km de l’agence — frais de livraison : {fee}.',
      distanceQuote: 'À {km} km de l’agence — frais de livraison sur devis.',
      distanceUnknown: 'Choisissez une adresse pour calculer les frais de livraison.',
      contact: 'Vos coordonnées',
      name: 'Nom et prénom',
      email: 'Adresse e-mail',
      phone: 'Téléphone',
      required: 'Champ obligatoire',
      emailInvalid: 'Adresse e-mail invalide',
      summary: 'Récapitulatif',
      rental: 'Location',
      deliveryFee: 'Frais de livraison',
      deliveryQuote: 'Sur devis',
      free: 'Offerte',
      deposit: 'Caution',
      depositNote: 'Caution débitée avec le paiement, puis restituée après le retour du matériel contrôlé.',
      total: 'Total à payer',
      availability: 'Disponibilité',
      checking: 'Vérification en cours…',
      available: 'Ce créneau est libre.',
      busy: 'Ce véhicule est déjà réservé sur une partie de ce créneau.',
      checkFailed: 'Impossible de vérifier la disponibilité pour le moment.',
      pay: 'Payer',
      payHint: 'Le paiement en ligne sera activé à la prochaine étape.',
      closeModal: 'Fermer la fenêtre de réservation'
    },

    footer: {
      legal: 'Mentions légales',
      privacy: 'Politique de confidentialité',
      terms: 'CGV',
      faq: 'Questions fréquentes',
      rights: 'Tous droits réservés.',
      contact: 'Nous contacter',
      dataUse: 'Vos données servent uniquement au traitement de votre réservation.',
      hosting: 'Hébergement'
    }
  },

  en: {
    meta: {
      title: 'AmiScoot Reims — PMR scooter and wheelchair rental',
      description: 'Rent a PMR scooter or a wheelchair in Reims. Delivery within a 15 km radius of Reims. Book online and pay securely.'
    },

    brand: { name: 'AmiScoot', tagline: 'Rental in Reims' },

    hero: {
      title: 'Rent a PMR scooter or a wheelchair in Reims',
      subtitle: 'Fast, simple, reliable. Delivery within a 15 km radius of Reims.'
    },

    category: {
      label: 'Category',
      scooter: 'PMR scooter',
      wheelchair: 'Wheelchair'
    },

    filters: {
      title: 'Filters',
      advanced: 'Advanced filters',
      open: 'Filters',
      close: 'Close',
      autonomie: 'Range',
      autonomieHint: 'Tick for a minimum range',
      autonomieUpTo: 'Up to {km} km',
      poids: 'Max. load',
      pliant: 'Folding',
      reset: 'Reset',
      activeCount: '{count} filter(s)'
    },

    sort: {
      label: 'Sort',
      price_asc: 'Price: low to high',
      price_desc: 'Price: high to low'
    },

    catalog: {
      count: { one: '{count} vehicle available', other: '{count} vehicles available' },
      empty: 'No vehicle matches these filters.',
      emptyHint: 'Try widening your selection.',
      inactive: 'Unavailable',
      perHour: '/ hour',
      autonomie: 'Range',
      poids: 'Max. load',
      pliant: 'Folding',
      imageAlt: '{name}'
    },

    pages: {
      backHome: 'Back to home',
      lastUpdated: 'Last updated: {date}',
      draftNotice: 'This page is being written. The final information will be published before the booking service goes live.',
      todo: 'To be completed',
      readMore: 'Read more'
    },

    faq: {
      title: 'Frequently asked questions',
      intro: 'Answers to the most common questions about PMR scooter and wheelchair rental in Reims.',
      items: [
        { q: 'Do I need a licence to rent a PMR scooter?', a: 'No. No licence or supporting document is required to rent a PMR scooter or a wheelchair. A form of ID is required when the deposit is taken.' },
        { q: 'How much is the deposit and when is it returned?', a: 'The deposit depends on the model and is shown on each product sheet. It is taken with the payment and released after the equipment is returned and checked.' },
        { q: 'What are the rental durations?', a: 'The minimum duration is 2 hours. You choose the start and end date and time; the total price is calculated automatically.' },
        { q: 'Do you deliver outside Reims?', a: 'Yes, within a 15 km radius of Reims. Delivery is free within 5 km and costs €50 beyond that, up to 15 km.' },
        { q: 'How does payment work?', a: 'Payment is made online by card through a secure service. This site does not store any card details.' },
        { q: 'Can I cancel my booking?', a: 'Yes. The full cancellation policy is set out in the Terms and Conditions, linked from the footer.' },
        { q: 'Is the equipment insured?', a: 'Yes, every piece of equipment is covered. The excess details are set out in the Terms and Conditions.' },
        { q: 'Do you offer long-term rates?', a: 'Yes, for rentals of several days. Call or WhatsApp us on +33 4 12 13 61 41 for a quote.' }
      ],
      stillStuck: 'Can\'t find your answer?'
    },

    cgv: {
      title: 'Terms and Conditions',
      intro: 'These terms govern the rental of PMR scooters and wheelchairs offered by AmiScoot. They apply to any booking made on this site.',
      sections: [
        { h: 'Article 1 — Identification of the provider', p: [
          'The provider is AmiScoot, whose registered office is at 180 Rue de Vesle, 51100 Reims, registered with the RCS of Reims under SIREN 994 251 882.',
          'Contact: info@amiscoot.fr — +33 4 12 13 61 41.'
        ] },
        { h: 'Article 2 — Subject and description of the service', p: [
          'The service covers short-term rental of PMR scooters and wheelchairs, with or without home delivery within a 15 km radius of Reims.',
          'Each product sheet states the hourly rate, the deposit, the range, the maximum supported weight and the technical characteristics of the equipment.'
        ] },
        { h: 'Article 3 — Booking and payment', p: [
          'A booking is final once paid for online by card through a secure payment provider. This site does not store any card data.',
          'Prices are in euros, all taxes included. The total comprises the rental price, delivery charges where applicable, and the deposit.'
        ] },
        { h: 'Article 4 — Minimum duration and cancellation', p: ['TO BE COMPLETED: free cancellation window, cancellation fees, partial or full refund.'] },
        { h: 'Article 5 — Deposit', p: [
          'A deposit is taken with the payment. Its amount is shown on each product sheet. It is released after the equipment is returned and checked.',
          'TO BE COMPLETED: how long after return the deposit is released.'
        ] },
        { h: 'Article 6 — Delivery and collection', p: [
          'Delivery is free within 5 km of Reims and costs €50 beyond that, up to 15 km. Beyond 15 km delivery is not offered.',
          'TO BE COMPLETED: delivery and in-store collection time slots.'
        ] },
        { h: 'Article 7 — Equipment, safety and limitation of liability', p: ['TO BE COMPLETED: condition of equipment on handover, user obligations, limitations of liability.'] },
        { h: 'Article 8 — Insurance', p: ['TO BE COMPLETED: insurer, policy number, excess and reimbursement cap.'] },
        { h: 'Article 9 — Personal data', p: ['Personal data is processed in accordance with the privacy policy, available from the footer.'] },
        { h: 'Article 10 — Governing law and disputes', p: ['TO BE COMPLETED: governing law, competent jurisdiction, consumer mediation mention.'] }
      ]
    },

    privacy: {
      title: 'Privacy Policy',
      intro: 'This page explains which personal data is collected, why, how long it is kept, and what your rights are.',
      sections: [
        { h: 'Data controller', p: [
          'AmiScoot, 180 Rue de Vesle, 51100 Reims. For any question about your personal data: info@amiscoot.fr.'
        ] },
        { h: 'Data collected', p: [
          'To process a booking we collect your name, email address, phone number and, for deliveries, the delivery address and its geographic coordinates.',
          'No card data is collected: payment is handled by a secure payment provider.'
        ] },
        { h: 'Purpose and legal basis', p: [
          'This data is used solely to process your booking, arrange the delivery, contact you about it, and produce the accounting and tax records required by law.',
          'Legal basis: performance of the contract concluded with you, and legal obligation for accounting and tax data.'
        ] },
        { h: 'Retention period', p: [
          'TO BE COMPLETED: retention periods for booking, accounting and contact data.'
        ] },
        { h: 'Recipients', p: [
          'Your data is neither sold nor passed on to third parties for commercial purposes. It may be shared with the technical providers needed to deliver the service (host, payment provider, booking management tool).',
          'TO BE COMPLETED: names of the processors actually used.'
        ] },
        { h: 'Your rights', p: [
          'You have the right to access, correct, erase, restrict, object to and port your data, and the right to give instructions on what happens to it after your death.',
          'You may also lodge a complaint with the CNIL (French data protection authority), 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, or at www.cnil.fr.'
        ] },
        { h: 'Cookies', p: [
          'This site sets no advertising cookies and no third-party trackers. Only your language preference (French or English) is stored locally in your browser, not on our servers.'
        ] }
      ]
    },

    legal: {
      title: 'Legal Notice',
      intro: 'Legal information about the operation of this site.',
      sections: [
        { h: 'Site publisher', p: [
          'AmiScoot',
          'SIREN: 994 251 882',
          'SIRET (registered office): 99425188200019',
          'Address: 180 Rue de Vesle, 51100 Reims, France',
          'Phone: +33 4 12 13 61 41',
          'Email: info@amiscoot.fr'
        ] },
        { h: 'Publication manager', p: ['TO BE COMPLETED: name of the legal representative.'] },
        { h: 'Hosting provider', p: [
          'CloudFlare, Inc.',
          'TO BE COMPLETED: the host\'s postal address and phone number, as set out in the Cloudflare terms applicable to you.'
        ] },
        { h: 'Intellectual property', p: [
          'All content on this site (texts, visuals, trademarks, source code) is protected by intellectual property law. Any total or partial reproduction is prohibited without prior written authorisation.'
        ] },
        { h: 'Liability', p: [
          'AmiScoot takes all reasonable care to ensure the accuracy and availability of the information published. Technical specifications and equipment availability may change; the product sheet shown at the time of booking is authoritative.'
        ] },
        { h: 'Consumer mediation', p: [
          'TO BE COMPLETED: name and contact details of the appointed consumer mediator, if any.'
        ] }
      ]
    },

    booking: {
      open: 'Book',
      title: 'Book this vehicle',
      close: 'Close',
      vehicle: 'Vehicle',
      perHour: '{price} / hour',
      period: 'Period',
      from: 'Start',
      to: 'End',
      duration: 'Duration',
      durationValue: '{hours} h',
      minHours: 'Minimum duration: {hours} h',
      maxDuration: 'Maximum duration: {days} days',
      endAfterStart: 'The end time must be after the start time.',
      endRequired: 'Enter the end time.',
      startInPast: 'The start time is already in the past.',
      endInPast: 'The end time is already in the past.',
      mode: 'Collection',
      pickup: 'Collect at our office',
      delivery: 'Home delivery',
      deliveryRadius: 'Within {max} km of Reims',
      storeAddress: '180 Rue de Vesle, 51100 Reims',
      deliveryAddress: 'Delivery address',
      addressHint: 'Type your town or postal code, then pick it from the list. For a street address, choose the town first.',
      addressResults: 'Suggested addresses',
      outsideRadius: 'Outside the delivery area ({max} km around Reims).',
      withinRadius: '{km} km from our office — delivery fee: {fee}.',
      distanceQuote: '{km} km from our office — delivery fee quoted separately.',
      distanceUnknown: 'Pick an address to calculate the delivery fee.',
      contact: 'Your details',
      name: 'Full name',
      email: 'Email address',
      phone: 'Phone',
      required: 'This field is required',
      emailInvalid: 'Invalid email address',
      summary: 'Summary',
      rental: 'Rental',
      deliveryFee: 'Delivery fee',
      deliveryQuote: 'Quoted separately',
      free: 'Free',
      deposit: 'Deposit',
      depositNote: 'The deposit is taken with the payment and released after the equipment is returned and checked.',
      total: 'Total due',
      availability: 'Availability',
      checking: 'Checking…',
      available: 'This slot is free.',
      busy: 'This vehicle is already booked for part of this slot.',
      checkFailed: 'Availability could not be checked right now.',
      pay: 'Pay',
      payHint: 'Online payment will be enabled at the next stage.',
      closeModal: 'Close the booking window'
    },

    footer: {
      legal: 'Legal notice',
      privacy: 'Privacy policy',
      terms: 'Terms',
      faq: 'FAQ',
      rights: 'All rights reserved.',
      contact: 'Contact us',
      dataUse: 'Your data is used solely to process your booking.',
      hosting: 'Hosting'
    }
  }
};
