const mongoose = require('mongoose');

const schemaDestination = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la destination est requis'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Le code de la destination est requis'],
    uppercase: true,
    maxlength: 3
  },
  image: {
    type: String,
    required: [true, "L'image de la destination est requise"]
  },
  prix: {
    type: String,
    required: [true, 'Le prix est requis']
  },
  dureeVol: {
    type: String,
    required: [true, 'La durée du vol est requise']
  },
  volsParSemaine: {
    type: String,
    required: [true, 'Le nombre de vols par semaine est requis']
  },
  avion: {
    type: String,
    required: [true, "Le type d'avion est requis"]
  },
  estActif: {
    type: Boolean,
    default: true
  },
  coordonnees: {
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true
});

// Index pour les recherches
schemaDestination.index({ nom: 'text', code: 'text' });
schemaDestination.index({ estActif: 1 });

module.exports = mongoose.model('Destination', schemaDestination);