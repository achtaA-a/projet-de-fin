const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  depart: {
    type: String,
    required: true
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  vol: {
    depart: String,
    destination: String,
    dateDepart: Date,
    dateRetour: Date,
    classe: {
      type: String,
      default: 'economy'
    }
  },
  passagers: [
    {
      prenom: String,
      nom: String,
      dateNaissance: Date,
      numeroPasseport: String
    }
  ],
  prixTotal: {
    type: Number,
    required: true
  },
  referenceReservation: {
    type: String,
    unique: true,
    default: () => 'REF-' + Date.now()
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
