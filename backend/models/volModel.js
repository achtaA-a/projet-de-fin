const mongoose = require('mongoose');

const volSchema = new mongoose.Schema({
  numeroVol: {
    type: String,
    required: [true, 'Le numéro de vol est obligatoire'],
    unique: true,
    trim: true,
    uppercase: true
  },
  compagnie: {
    type: String,
    required: [true, 'La compagnie aérienne est obligatoire'],
    trim: true
  },
  destinationDepart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: [true, 'La destination de départ est obligatoire']
  },
  destinationArrivee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: [true, 'La destination d\'arrivée est obligatoire']
  },
  dateDepart: {
    type: Date,
    required: [true, 'La date de départ est obligatoire']
  },
  dateArrivee: {
    type: Date,
    required: [true, 'La date d\'arrivée est obligatoire']
  },
  duree: {
    type: String,
    required: [true, 'La durée du vol est obligatoire']
  },
  placesDisponibles: {
    type: Number,
    required: [true, 'Le nombre de places disponibles est obligatoire'],
    min: [0, 'Le nombre de places ne peut pas être négatif']
  },
  prix: {
    economie: {
      type: Number,
      required: [true, 'Le prix en classe économie est obligatoire'],
      min: [0, 'Le prix ne peut pas être négatif']
    },
    affaire: {
      type: Number,
      required: [true, 'Le prix en classe affaire est obligatoire'],
      min: [0, 'Le prix ne peut pas être négatif']
    },
    premiere: {
      type: Number,
      required: [true, 'Le prix en première classe est obligatoire'],
      min: [0, 'Le prix ne peut pas être négatif']
    }
  },
  estActif: {
    type: Boolean,
    default: true
  },
  informations: {
    bagageCabine: {
      type: String,
      default: '1 bagage cabine (7kg)'
    },
    bagageSoute: {
      type: String,
      default: '1 bagage soute (23kg)'
    },
    repasInclus: {
      type: Boolean,
      default: true
    },
    wifi: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
volSchema.index({ dateDepart: 1 });
volSchema.index({ destinationDepart: 1, destinationArrivee: 1 });
volSchema.index({ estActif: 1 });

// Middleware pour calculer la durée avant sauvegarde
volSchema.pre('save', function(next) {
  if (this.dateDepart && this.dateArrivee) {
    const diffMs = this.dateArrivee - this.dateDepart;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    this.duree = `${diffHours}h ${diffMinutes}m`;
  }
  next();
});

// Méthode pour vérifier si le vol est complet
volSchema.methods.estComplet = function() {
  return this.placesDisponibles === 0;
};

// Méthode pour réduire les places disponibles
volSchema.methods.reduirePlaces = function(nombre) {
  if (this.placesDisponibles >= nombre) {
    this.placesDisponibles -= nombre;
    return true;
  }
  return false;
};

module.exports = mongoose.model('Vol', volSchema);