const Destination = require('../models/destinationModel');

// --- Obtenir toutes les destinations avec pagination ---
exports.obtenirToutesDestinations = async (req, res) => {
  try {
    // Récupération des paramètres de pagination depuis la query string
    let page = parseInt(req.query.page) || 1;       // page actuelle (1 par défaut)
    let limit = parseInt(req.query.limit) || 10;    // nombre d'éléments par page (10 par défaut)
    const skip = (page - 1) * limit;                // nombre d'éléments à sauter

    // Comptage total des destinations actives
    const total = await Destination.countDocuments({ estActif: true });

    // Récupération des destinations avec pagination
    const destinations = await Destination.find({ estActif: true })
      .select('-createdAt -updatedAt')
      .sort({ nom: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      statut: 'succes',
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      donnees: {
        destinations
      }
    });
  } catch (erreur) {
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération des destinations'
    });
  }
};

// --- Obtenir UNE destination par ID ---
exports.obtenirDestination = async (req, res) => { 
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        statut: 'erreur',
        message: 'Destination non trouvée'
      });
    }

    res.status(200).json({
      statut: 'succes',
      donnees: {
        destination
      }
    });
  } catch (erreur) {
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération de la destination'
    });
  }
};

// --- Créer une nouvelle destination ---
exports.creerDestination = async (req, res) => {
  try {
    // On récupère toutes les données du corps
    const data = req.body;

    // Si une image a été uploadée, on l'ajoute au champ `image`
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    // CORRECTION: Structurer les données imbriquées
    const donneesDestination = {
      nom: data.nom,
      code: data.code,
      pays: data.pays,
      ville: data.ville,
      description: data.description,
      prix: data.prix,
      dureeVol: data.dureeVol,
      volsParSemaine: data.volsParSemaine,
      avion: data.avion,
      fuseauHoraire: data.fuseauHoraire || 'UTC+1',
      estActif: data.estActif !== 'false', // Convertir en boolean
      image: data.image,
      aeroport: {
        nom: data['aeroport[nom]'] || data.aeroport?.nom,
        code: data['aeroport[code]'] || data.aeroport?.code
      }
    };

    // Ajouter les coordonnées si présentes
    if (data['coordonnees[latitude]'] || data.coordonnees?.latitude) {
      donneesDestination.coordonnees = {
        latitude: parseFloat(data['coordonnees[latitude]'] || data.coordonnees?.latitude),
        longitude: parseFloat(data['coordonnees[longitude]'] || data.coordonnees?.longitude)
      };
    }

    console.log('📦 Données destination préparées:', donneesDestination);

    // Créer la nouvelle destination
    const nouvelleDestination = await Destination.create(donneesDestination);

    res.status(201).json({
      statut: 'succes',
      message: 'Destination créée avec succès',
      donnees: {
        destination: nouvelleDestination,
      },
    });
  } catch (erreur) {
    console.error('❌ Erreur création destination:', erreur);
    
    if (erreur.name === 'ValidationError') {
      const details = Object.values(erreur.errors).map(e => e.message);
      return res.status(400).json({
        statut: 'erreur',
        message: 'Erreur de validation des données',
        details
      });
    }

    if (erreur.code === 11000) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Une destination avec ce nom ou code existe déjà'
      });
    }

    res.status(400).json({
      statut: 'erreur',
      message: erreur.message,
    });
  }
};