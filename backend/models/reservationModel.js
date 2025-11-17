const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  referenceReservation: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: false // Rendre optionnel
  },
  depart: {
    type: String,
    required: [true, 'Le lieu de départ est obligatoire'],
    trim: true
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: [true, 'La destination est obligatoire']
  },
  vol: {
    numeroVol: {
      type: String,
      required: [true, 'Le numéro de vol est obligatoire'],
      trim: true,
      uppercase: true
    },
    dateDepart: {
      type: Date,
      required: [true, 'La date de départ est obligatoire']
    },
    dateRetour: {
      type: Date
    },
    classe: {
      type: String,
      enum: ['economie', 'affaire', 'premiere'],
      default: 'economie'
    }
  },
  passagers: [{
    prenom: {
      type: String,
      required: [true, 'Le prénom du passager est obligatoire'],
      trim: true
    },
    nom: {
      type: String,
      required: [true, 'Le nom du passager est obligatoire'],
      trim: true
    },
    dateNaissance: {
      type: Date,
      required: [true, 'La date de naissance est obligatoire']
    },
    numeroPasseport: {
      type: String,
      required: [true, 'Le numéro de passeport est obligatoire'],
      trim: true,
      uppercase: true
    },
    nationalite: {
      type: String,
      default: 'Non spécifiée'
    },
    telephone: {
      type: String,
      default: 'Non spécifié'
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    }
  }],
  prixTotal: {
    type: Number,
    required: [true, 'Le prix total est obligatoire'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  destinationDetails: {
    type: Object,
    required: true
  },
  paiement: {
    method: {
      type: String,
      enum: ['movmoney', 'airtelmoney', 'carte', 'non_defini'],
      default: 'non_defini'
    },
    statut: {
      type: String,
      enum: ['en_attente', 'complete', 'echoue', 'rembourse'],
      default: 'en_attente'
    },
    datePaiement: {
      type: Date
    },
    montant: {
      type: Number,
      required: true
    },
    referenceTransaction: {
      type: String,
      trim: true
    }
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'annulee', 'terminee'],
    default: 'en_attente'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
reservationSchema.index({ referenceReservation: 1 });
reservationSchema.index({ utilisateurId: 1 });
reservationSchema.index({ 'vol.dateDepart': 1 });
reservationSchema.index({ statut: 1 });
reservationSchema.index({ 'paiement.statut': 1 });

// CORRECTION: Fonction pour générer une référence unique
const genererReference = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `RES-${timestamp}-${random}`;
};

// CORRECTION: Middleware pre-save amélioré
reservationSchema.pre('save', async function(next) {
  if (this.isNew && !this.referenceReservation) {
    let referenceUnique = false;
    let tentative = 0;
    const maxTentatives = 5;
    
    while (!referenceUnique && tentative < maxTentatives) {
      const referenceCandidate = genererReference();
      
      try {
        const existingReservation = await mongoose.model('Reservation').findOne({
          referenceReservation: referenceCandidate
        });
        
        if (!existingReservation) {
          this.referenceReservation = referenceCandidate;
          referenceUnique = true;
        }
      } catch (error) {
        // En cas d'erreur, on continue avec une nouvelle tentative
        console.warn('Erreur lors de la vérification de la référence:', error);
      }
      
      tentative++;
    }
    
    if (!referenceUnique) {
      // Fallback: utiliser timestamp + random
      this.referenceReservation = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  }
  next();
});

// CORRECTION: Méthode statique pour créer avec référence
reservationSchema.statics.creerAvecReference = async function(donnees) {
  const reference = genererReference();
  const reservation = new this({ ...donnees, referenceReservation: reference });
  return await reservation.save();
};

// Méthode pour vérifier si la réservation peut être annulée
reservationSchema.methods.peutEtreAnnulee = function() {
  const maintenant = new Date();
  const dateDepart = new Date(this.vol.dateDepart);
  const diffHeures = (dateDepart - maintenant) / (1000 * 60 * 60);
  
  return diffHeures > 24 && this.statut === 'confirmee';
};

// Méthode statique pour obtenir les réservations par statut
reservationSchema.statics.parStatut = function(statut) {
  return this.find({ statut }).populate('destinationId').populate('utilisateurId');
};

module.exports = mongoose.model('Reservation', reservationSchema);