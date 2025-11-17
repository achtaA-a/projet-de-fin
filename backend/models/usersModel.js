const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const schemaUtilisateur = new mongoose.Schema(
  {
    prenom: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
    },

    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },

    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Email invalide'],
      trim: true,
    },

    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false, // Ne jamais envoyer le mot de passe dans les réponses
    },

    telephone: {
      type: String,
      required: [true, 'Le numéro de téléphone est requis'],
      trim: true,
    },

    dateNaissance: {
      type: Date,
      required: [true, 'La date de naissance est requise'],
    },

    nationalite: {
      type: String,
      default: 'Tchadienne',
      trim: true,
    },

    numeroPasseport: {
      type: String,
      sparse: true,
      trim: true,
    },

    estActif: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ['utilisateur', 'admin'],
      default: 'utilisateur',
    },

    avatar: {
      type: String,
      default: null,
    },
  },

  { timestamps: true }
);

// ============================================================
// 🔐 Hachage du mot de passe avant sauvegarde
// ============================================================
schemaUtilisateur.pre('save', async function (next) {
  if (!this.isModified('motDePasse')) return next(); // si pas modifié → ne pas re-hacher
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
  next();
});

// ============================================================
// 🔍 Méthode pour vérifier le mot de passe
// ============================================================
schemaUtilisateur.methods.verifierMotDePasse = async function (
  motDePasseCandidat,
  motDePasseUtilisateur
) {
  return await bcrypt.compare(motDePasseCandidat, motDePasseUtilisateur);
};

module.exports = mongoose.model('Utilisateur', schemaUtilisateur);
