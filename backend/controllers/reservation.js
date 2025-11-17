const Reservation = require('../models/reservationModel');
const Destination = require('../models/destinationModel');

// 📌 Obtenir toutes les réservations
exports.obtenirReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('destinationId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      statut: 'succes',
      donnees: { reservations }
    });

  } catch (erreur) {
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération des réservations'
    });
  }
};

// 📌 Créer une réservation
exports.creerReservation = async (req, res) => {
  try {
    const {
      depart,
      destinationId,
      vol,
      passagers,
      prixTotal,
      destinationDetails,
      paiement,
      utilisateurId
    } = req.body;

    // Vérification champs obligatoires
    if (!depart || !destinationId || !vol || !passagers || prixTotal == null) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Champs obligatoires manquants'
      });
    }

    // Vérification vol
    if (!vol.dateDepart || !vol.depart || !vol.destination) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Le vol doit contenir depart, destination et dateDepart'
      });
    }

    // Génération numéro vol auto
    if (!vol.numeroVol) {
      const prefixes = ['TA', 'TC', 'TK', 'TS'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      vol.numeroVol = `${prefix}${Math.floor(100 + Math.random() * 900)}`;
    }

    // Vérification passagers
    for (let i = 0; i < passagers.length; i++) {
      const p = passagers[i];
      const champs = ['prenom', 'nom', 'dateNaissance', 'numeroPasseport'];
      const manquants = champs.filter(c => !p[c]);
      if (manquants.length) {
        return res.status(400).json({
          statut: 'erreur',
          message: `Passager ${i + 1} : Champs manquants ${manquants.join(', ')}`
        });
      }
    }

    // Vérification destination
    const destinationExistante = await Destination.findById(destinationId);
    if (!destinationExistante) {
      return res.status(404).json({ statut: 'erreur', message: 'Destination non trouvée' });
    }

    // Création
    const nouvelleReservation = await Reservation.creerAvecReference({
      depart,
      destinationId,
      utilisateurId: utilisateurId || null,
      vol,
      passagers,
      prixTotal,
      destinationDetails: destinationDetails || destinationExistante.toObject(),
      paiement: paiement || {
        method: 'non_defini',
        statut: 'en_attente',
        datePaiement: null,
        montant: prixTotal
      },
      statut: 'en_attente'
    });

    await nouvelleReservation.populate('destinationId');

    res.status(201).json({
      statut: 'succes',
      message: 'Réservation créée',
      donnees: { reservation: nouvelleReservation }
    });

  } catch (erreur) {
    console.error('Erreur création réservation:', erreur);
    res.status(500).json({ statut: 'erreur', message: 'Erreur interne' });
  }
};

// 📌 Obtenir une réservation par ID
exports.obtenirReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('destinationId');
    if (!reservation) {
      return res.status(404).json({ statut: 'erreur', message: 'Réservation non trouvée' });
    }
    res.status(200).json({ statut: 'succes', donnees: { reservation } });
  } catch (erreur) {
    res.status(500).json({ statut: 'erreur', message: 'Erreur serveur' });
  }
};

// 📌 Obtenir par référence
exports.obtenirReservationParReference = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      referenceReservation: req.params.reference
    }).populate('destinationId');

    if (!reservation) {
      return res.status(404).json({ statut: 'erreur', message: 'Réservation non trouvée' });
    }

    res.status(200).json({ statut: 'succes', donnees: { reservation } });

  } catch (erreur) {
    res.status(500).json({ statut: 'erreur', message: 'Erreur serveur' });
  }
};

// 📌 Mettre à jour
exports.mettreAJourReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('destinationId');

    if (!reservation) {
      return res.status(404).json({ statut: 'erreur', message: 'Réservation non trouvée' });
    }

    res.status(200).json({
      statut: 'succes',
      message: 'Mise à jour effectuée',
      donnees: { reservation }
    });

  } catch (erreur) {
    res.status(500).json({ statut: 'erreur', message: 'Erreur mise à jour' });
  }
};

// 📌 Supprimer
exports.supprimerReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ statut: 'erreur', message: 'Réservation non trouvée' });
    }
    res.status(200).json({ statut: 'succes', message: 'Supprimée' });
  } catch (erreur) {
    res.status(500).json({ statut: 'erreur', message: 'Erreur suppression' });
  }
};

// 📌 Statistiques
exports.obtenirStatistiques = async (req, res) => {
  try {
    const totalReservations = await Reservation.countDocuments();
    const chiffreAffaire = await Reservation.aggregate([
      { $group: { _id: null, total: { $sum: '$prixTotal' } } }
    ]);

    const reservationsParMois = await Reservation.aggregate([
      {
        $group: {
          _id: { annee: { $year: '$createdAt' }, mois: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$prixTotal' }
        }
      },
      { $sort: { '_id.annee': -1, '_id.mois': -1 } }
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
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur statistiques'
    });
  }
};

// 📌 Annuler
exports.annulerReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ statut: 'erreur', message: 'Réservation non trouvée' });
    }

    reservation.statut = 'annulee';
    if (reservation.paiement) reservation.paiement.statut = 'rembourse';

    await reservation.save();

    res.status(200).json({
      statut: 'succes',
      message: 'Réservation annulée',
      donnees: { reservation }
    });

  } catch (erreur) {
    res.status(500).json({ statut: 'erreur', message: 'Erreur annulation' });
  }
};
