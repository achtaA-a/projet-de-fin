const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la destination est obligatoire'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Le code de la destination est obligatoire'],
    trim: true,
    uppercase: true,
    unique: true,
    maxlength: [3, 'Le code doit contenir 3 caractères']
  },
  pays: {
    type: String,
    required: [true, 'Le pays est obligatoire'],
    trim: true
  },
  ville: {
    type: String,
    required: [true, 'La ville est obligatoire'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  estActif: {
    type: Boolean,
    default: true
  },
  coordonnees: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  fuseauHoraire: {
    type: String,
    default: 'UTC+1'
  },
  // Informations sur les vols
  prix: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  dureeVol: {
    type: String,
    required: [true, 'La durée du vol est obligatoire'],
    trim: true
  },
  volsParSemaine: {
    type: Number,
    required: [true, 'Le nombre de vols par semaine est obligatoire'],
    min: [1, 'Il doit y avoir au moins 1 vol par semaine'],
    max: [100, 'Le nombre maximum de vols par semaine est de 100']
  },
  avion: {
    type: String,
    required: [true, 'Le type d\'avion est obligatoire'],
    trim: true
  },
  aeroport: {
    nom: {
      type: String,
      required: [true, 'Le nom de l\'aéroport est obligatoire'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Le code de l\'aéroport est obligatoire'],
      trim: true,
      uppercase: true,
      maxlength: [4, 'Le code de l\'aéroport doit contenir 3-4 caractères']
    }
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
destinationSchema.index({ estActif: 1 });
destinationSchema.index({ pays: 1, ville: 1 });
destinationSchema.index({ code: 1 });

// Méthode pour obtenir le nom complet
destinationSchema.methods.getNomComplet = function() {
  return `${this.ville}, ${this.pays} (${this.code})`;
};

module.exports = mongoose.model('Destination', destinationSchema);