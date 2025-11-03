const Reservation = require('../models/reservationModel');
const Destination = require('../models/destinationModel');

// Créer une réservation
exports.creerReservation = async (req, res) => {
  try {
    console.log('📦 Données reçues pour réservation:', req.body);
    
    const {
      depart,
      destinationId,
      vol,
      passagers,
      prixTotal,
      destinationDetails
    } = req.body;

    // Validation des champs requis
    if (!depart || !destinationId || !vol || !passagers || prixTotal === undefined) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Champs manquants: depart, destinationId, vol, passagers et prixTotal sont requis'
      });
    }

    // Validation du format des passagers
    if (!Array.isArray(passagers) || passagers.length === 0) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Au moins un passager est requis'
      });
    }

    // Vérifier que la destination existe
    const destinationExistante = await Destination.findById(destinationId);
    if (!destinationExistante) {
      return res.status(404).json({
        statut: 'erreur',
        message: 'Destination non trouvée'
      });
    }

    // Validation des données des passagers
    for (let i = 0; i < passagers.length; i++) {
      const p = passagers[i];
      if (!p.prenom || !p.nom || !p.dateNaissance || !p.numeroPasseport) {
        return res.status(400).json({
          statut: 'erreur',
          message: `Passager ${i + 1}: Tous les champs (prénom, nom, date de naissance, numéro de passeport) sont requis`
        });
      }

      // Validation de la date de naissance
      const dateNaissance = new Date(p.dateNaissance);
      if (isNaN(dateNaissance.getTime())) {
        return res.status(400).json({
          statut: 'erreur',
          message: `Passager ${i + 1}: Date de naissance invalide`
        });
      }

      // Vérifier que la date de naissance est dans le passé
      if (dateNaissance >= new Date()) {
        return res.status(400).json({
          statut: 'erreur',
          message: `Passager ${i + 1}: La date de naissance doit être dans le passé`
        });
      }
    }

    // Validation des dates de vol
    const dateDepart = new Date(vol.dateDepart);
    if (isNaN(dateDepart.getTime())) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Date de départ invalide'
      });
    }

    if (vol.dateRetour) {
      const dateRetour = new Date(vol.dateRetour);
      if (isNaN(dateRetour.getTime())) {
        return res.status(400).json({
          statut: 'erreur',
          message: 'Date de retour invalide'
        });
      }
      if (dateRetour <= dateDepart) {
        return res.status(400).json({
          statut: 'erreur',
          message: 'La date de retour doit être après la date de départ'
        });
      }
    }

    // Création de la réservation
    const nouvelleReservation = await Reservation.create({
      depart,
      destinationId,
      vol: {
        depart: vol.depart,
        destination: vol.destination,
        dateDepart: dateDepart,
        dateRetour: vol.dateRetour ? new Date(vol.dateRetour) : null,
        classe: vol.classe || 'economy'
      },
      passagers: passagers.map(p => ({
        prenom: p.prenom.trim(),
        nom: p.nom.trim(),
        dateNaissance: new Date(p.dateNaissance),
        numeroPasseport: p.numeroPasseport.trim()
      })),
      prixTotal: Number(prixTotal),
      destinationDetails: destinationDetails || null
    });

    console.log('✅ Réservation créée:', nouvelleReservation.referenceReservation);

    res.status(201).json({
      statut: 'succes',
      message: 'Réservation créée avec succès',
      donnees: {
        reservation: nouvelleReservation
      }
    });

  } catch (erreur) {
    console.error('❌ Erreur création réservation:', erreur);
    
    // Gestion des erreurs de duplication de référence
    if (erreur.code === 11000) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Erreur de référence de réservation, veuillez réessayer'
      });
    }

    // Erreurs de validation Mongoose
    if (erreur.name === 'ValidationError') {
      const messages = Object.values(erreur.errors).map(err => err.message);
      return res.status(400).json({
        statut: 'erreur',
        message: 'Données de réservation invalides',
        details: messages
      });
    }

    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur interne du serveur lors de la création de la réservation'
    });
  }
};

// 🚀 Récupérer toutes les réservations (optimisé)
exports.obtenirReservations = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', lean = true } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Les paramètres "page" et "limit" doivent être des nombres positifs.'
      });
    }

    const skip = (pageNum - 1) * limitNum;

    // ⚡ Utilisation de .lean() pour rendre les résultats beaucoup plus légers et rapides à renvoyer
    // ⚡ Promise.all pour exécuter les requêtes en parallèle
    const [reservations, total] = await Promise.all([
      Reservation.find({}, '-__v') // on exclut le champ __v inutile
        .populate('destinationId', 'nom pays code') // on ne charge que les champs nécessaires
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(), // ➜ supprime la surcharge Mongoose, renvoie des objets JS purs
      Reservation.estimatedDocumentCount() // ➜ plus rapide que countDocuments()
    ]);

    // ⚡ Réponse immédiate
    res.status(200).json({
      statut: 'succes',
      resultats: reservations.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      donnees: { reservations }
    });

  } catch (erreur) {
    console.error('❌ Erreur récupération réservations :', erreur.message);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur interne du serveur lors de la récupération des réservations',
      details: erreur.message
    });
  }
};
// Récupérer une réservation spécifique
exports.obtenirReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('destinationId');

    if (!reservation) {
      return res.status(404).json({
        statut: 'erreur',
        message: 'Réservation non trouvée'
      });
    }

    res.status(200).json({
      statut: 'succes',
      donnees: {
        reservation
      }
    });
  } catch (erreur) {
    console.error('❌ Erreur récupération réservation:', erreur);
    
    if (erreur.name === 'CastError') {
      return res.status(400).json({
        statut: 'erreur',
        message: 'ID de réservation invalide'
      });
    }

    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération de la réservation'
    });
  }
};

// Récupérer une réservation par référence
exports.obtenirReservationParReference = async (req, res) => {
  try {
    const { reference } = req.params;
    
    const reservation = await Reservation.findOne({ referenceReservation: reference })
      .populate('destinationId');

    if (!reservation) {
      return res.status(404).json({
        statut: 'erreur',
        message: 'Réservation non trouvée'
      });
    }

    res.status(200).json({
      statut: 'succes',
      donnees: {
        reservation
      }
    });
  } catch (erreur) {
    console.error('❌ Erreur récupération réservation par référence:', erreur);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération de la réservation'
    });
  }
};

// Mettre à jour une réservation
exports.mettreAJourReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('destinationId');

    if (!reservation) {
      return res.status(404).json({
        statut: 'erreur',
        message: 'Réservation non trouvée'
      });
    }

    res.status(200).json({
      statut: 'succes',
      message: 'Réservation mise à jour avec succès',
      donnees: {
        reservation
      }
    });
  } catch (erreur) {
    console.error('❌ Erreur mise à jour réservation:', erreur);
    
    if (erreur.name === 'ValidationError') {
      const messages = Object.values(erreur.errors).map(err => err.message);
      return res.status(400).json({
        statut: 'erreur',
        message: 'Données de mise à jour invalides',
        details: messages
      });
    }

    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la mise à jour de la réservation'
    });
  }
};

// Supprimer une réservation
exports.supprimerReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        statut: 'erreur',
        message: 'Réservation non trouvée'
      });
    }

    res.status(200).json({
      statut: 'succes',
      message: 'Réservation supprimée avec succès',
      donnees: null
    });
  } catch (erreur) {
    console.error('❌ Erreur suppression réservation:', erreur);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la suppression de la réservation'
    });
  }
};

// Obtenir les statistiques des réservations
exports.obtenirStatistiques = async (req, res) => {
  try {
    const totalReservations = await Reservation.countDocuments();
    const chiffreAffaire = await Reservation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$prixTotal' }
        }
      }
    ]);
    
    const reservationsParMois = await Reservation.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$prixTotal' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      statut: 'succes',
      donnees: {
        totalReservations,
        chiffreAffaire: chiffreAffaire[0]?.total || 0,
        reservationsParMois
      }
    });
  } catch (erreur) {
    console.error('❌ Erreur statistiques réservations:', erreur);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};