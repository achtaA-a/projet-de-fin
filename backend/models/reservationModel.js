const mongoose = require('mongoose');

const passagerSchema = new mongoose.Schema({
  prenom: {
    type: String,
    required: [true, 'Le prénom du passager est requis'],
    trim: true
  },
  nom: {
    type: String,
    required: [true, 'Le nom du passager est requis'],
    trim: true
  },
  dateNaissance: {
    type: Date,
    required: [true, 'La date de naissance est requise']
  },
  numeroPasseport: {
    type: String,
    required: [true, 'Le numéro de passeport est requis'],
    trim: true
  }
});

const volSchema = new mongoose.Schema({
  depart: {
    type: String,
    required: [true, 'Le lieu de départ est requis'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'La destination est requise'],
    trim: true
  },
  dateDepart: {
    type: Date,
    required: [true, 'La date de départ est requise']
  },
  dateRetour: {
    type: Date
  },
  classe: {
    type: String,
    enum: ['economy', 'business', 'first'],
    default: 'economy'
  }
});

const reservationSchema = new mongoose.Schema({
  referenceReservation: {
    type: String,
    unique: true,
    default: function() {
      return 'RES-' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 3).toUpperCase();
    }
  },
  depart: {
    type: String,
    required: [true, 'Le lieu de départ est requis'],
    trim: true
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: [true, 'L\'ID de la destination est requis']
  },
  vol: {
    type: volSchema,
    required: [true, 'Les informations du vol sont requises']
  },
  passagers: [passagerSchema],
  prixTotal: {
    type: Number,
    required: [true, 'Le prix total est requis'],
    min: [0, 'Le prix total ne peut pas être négatif']
  },
  statut: {
    type: String,
    enum: ['confirmée', 'en_attente', 'annulée'],
    default: 'confirmée'
  },
  destinationDetails: {
    type: Object,
    default: null
  }
}, {
  timestamps: true
});

// Middleware pour peupler la destination
reservationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'destinationId',
    select: 'nom code prix dureeVol image'
  });
  next();
});

// Méthode pour obtenir le résumé de la réservation
reservationSchema.methods.getResume = function() {
  return {
    reference: this.referenceReservation,
    depart: this.vol.depart,
    destination: this.vol.destination,
    dateDepart: this.vol.dateDepart,
    nombrePassagers: this.passagers.length,
    prixTotal: this.prixTotal,
    statut: this.statut
  };
};

module.exports = mongoose.model('Reservation', reservationSchema);