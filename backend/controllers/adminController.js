// controllers/adminController.js
const Reservation = require('../models/reservationModel');
const Utilisateur = require('../models/usersModel');
const Vol = require('../models/volModel');
const Destination = require('../models/destinationModel');

// 🎯 Statistiques du dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalReservations,
      totalVols,
      totalUtilisateurs,
      chiffreAffaire,
      reservationsEnAttente,
      reservationsMoisCourant,
      reservationsMoisPrecedent
    ] = await Promise.all([
      Reservation.countDocuments(),
      Vol.countDocuments({ estActif: true }),
      Utilisateur.countDocuments({ estActif: true }),
      Reservation.aggregate([
        { $match: { 'paiement.statut': 'complete' } },
        { $group: { _id: null, total: { $sum: '$prixTotal' } } }
      ]),
      Reservation.countDocuments({ statut: 'en_attente' }),
      Reservation.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      Reservation.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    ]);

    // Calcul de l'évolution
    const evolutionReservations = reservationsMoisPrecedent > 0 
      ? Math.round(((reservationsMoisCourant - reservationsMoisPrecedent) / reservationsMoisPrecedent) * 100)
      : 0;

    res.status(200).json({
      statut: 'succes',
      donnees: {
        totalReservations,
        totalVols,
        totalUtilisateurs,
        chiffreAffaire: chiffreAffaire[0]?.total || 0,
        reservationsEnAttente,
        evolutionReservations
      }
    });
  } catch (erreur) {
    console.error('❌ Erreur statistiques dashboard:', erreur);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// 📊 Statistiques avancées
exports.getAdvancedStats = async (req, res) => {
  try {
    const { periode = 'mois' } = req.query;
    
    let groupFormat;
    switch (periode) {
      case 'jour':
        groupFormat = { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'semaine':
        groupFormat = { 
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      default: // mois
        groupFormat = { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const statsReservations = await Reservation.aggregate([
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          revenue: { $sum: '$prixTotal' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 12 }
    ]);

    // Top destinations
    const topDestinations = await Reservation.aggregate([
      {
        $group: {
          _id: '$destinationId',
          count: { $sum: 1 },
          revenue: { $sum: '$prixTotal' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'destinations',
          localField: '_id',
          foreignField: '_id',
          as: 'destination'
        }
      },
      { $unwind: '$destination' }
    ]);

    res.status(200).json({
      statut: 'succes',
      donnees: {
        reservationsParPeriode: statsReservations,
        topDestinations,
        periode
      }
    });
  } catch (erreur) {
    console.error('❌ Erreur statistiques avancées:', erreur);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération des statistiques avancées'
    });
  }
};

// 📝 Activités récentes
exports.getRecentActivities = async (req, res) => {
  try {
    const recentActivities = await Reservation.find()
      .populate('destinationId', 'nom')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const activities = recentActivities.map(reservation => ({
      id: reservation._id,
      type: 'reservation',
      description: `Nouvelle réservation pour ${reservation.destinationId?.nom || 'Destination inconnue'}`,
      time: reservation.createdAt,
      icon: '📋',
      user: `${reservation.passagers[0]?.prenom} ${reservation.passagers[0]?.nom}`
    }));

    res.status(200).json({
      statut: 'succes',
      donnees: activities
    });
  } catch (erreur) {
    console.error('❌ Erreur activités récentes:', erreur);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération des activités récentes'
    });
  }
};

// 👥 Gestion des utilisateurs
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [utilisateurs, total] = await Promise.all([
      Utilisateur.find({})
        .select('-motDePasse')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Utilisateur.countDocuments()
    ]);

    res.status(200).json({
      statut: 'succes',
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      donnees: { utilisateurs }
    });
  } catch (erreur) {
    console.error('❌ Erreur récupération utilisateurs:', erreur);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Empêcher la modification du mot de passe via cette route
    if (updates.motDePasse) {
      delete updates.motDePasse;
    }

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-motDePasse');

    if (!utilisateur) {
      return res.status(404).json({
        statut: 'erreur',
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      statut: 'succes',
      message: 'Utilisateur mis à jour avec succès',
      donnees: { utilisateur }
    });
  } catch (erreur) {
    console.error('❌ Erreur mise à jour utilisateur:', erreur);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
};

// ✈️ Gestion des vols
exports.getVols = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [vols, total] = await Promise.all([
      Vol.find({})
        .populate('destinationDepart')
        .populate('destinationArrivee')
        .sort({ dateDepart: 1 })
        .skip(skip)
        .limit(limit),
      Vol.countDocuments()
    ]);

    res.status(200).json({
      statut: 'succes',
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      donnees: { vols }
    });
  } catch (erreur) {
    console.error('❌ Erreur récupération vols:', erreur);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération des vols'
    });
  }
};

exports.createVol = async (req, res) => {
  try {
    const volData = req.body;

    // Validation des dates
    const dateDepart = new Date(volData.dateDepart);
    if (dateDepart <= new Date()) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'La date de départ doit être dans le futur'
      });
    }

    if (volData.dateRetour && new Date(volData.dateRetour) <= dateDepart) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'La date de retour doit être après la date de départ'
      });
    }

    const nouveauVol = await Vol.create(volData);

    res.status(201).json({
      statut: 'succes',
      message: 'Vol créé avec succès',
      donnees: { vol: nouveauVol }
    });
  } catch (erreur) {
    console.error('❌ Erreur création vol:', erreur);
    
    if (erreur.name === 'ValidationError') {
      const messages = Object.values(erreur.errors).map(err => err.message);
      return res.status(400).json({
        statut: 'erreur',
        message: 'Données de vol invalides',
        details: messages
      });
    }

    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la création du vol'
    });
  }
};