const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const { v4 } = require("uuid");

const Utilisateur = require('../models/usersModel'); // ✔️ Chemin correct
const generateOTP = require("../utils/generateOTP");
const otpModel = require("../models/otpModel");
const transporter = require("../utils/transporter");

// Vérification du secret JWT
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET manquant dans le .env");
  process.exit(1);
}

// Création du token JWT
const creerToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

/* =====================================================
  ✅ INSCRIPTION UTILISATEUR (avec création OTP)
===================================================== */
exports.inscription = async (req, res) => {
  try {
    const {
      prenom,
      nom,
      email,
      motDePasse,
      telephone,
      dateNaissance,
      nationalite,
      numeroPasseport,
      role
    } = req.body;

    // Champs obligatoires
    if (!prenom || !nom || !email || !motDePasse) {
      return res.status(400).json({
        statut: "erreur",
        message: "Veuillez remplir tous les champs obligatoires."
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({
        statut: "erreur",
        message: "Un utilisateur avec cet email existe déjà."
      });
    }

    // Création d’un nouvel utilisateur
    const nouvelUtilisateur = await Utilisateur.create({
      prenom,
      nom,
      email,
      motDePasse,
      telephone,
      dateNaissance,
      nationalite,
      numeroPasseport,
      role: role === "admin" ? "admin" : "utilisateur" // ✔️ Admin possible
    });

    const token = creerToken(nouvelUtilisateur._id);
    nouvelUtilisateur.motDePasse = undefined;

    // Génération OTP
    const otp = generateOTP();

    try {
      await otpModel.create({
        userId: nouvelUtilisateur._id,
        otp,
        otpToken: token,
        purpose: "verify-email"
      });
    } catch (error) {
      await Utilisateur.findByIdAndDelete(nouvelUtilisateur._id);
      throw new Error("Échec de la création de l'OTP.");
    }

    // Envoi email OTP
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: nouvelUtilisateur.email,
        subject: "Vérification de votre email",
        html: `
          <h1>Vérification email</h1>
          <p>Voici votre code OTP :</p>
          <h2>${otp}</h2>
        `
      });
    } catch (err) {
      await Utilisateur.findByIdAndDelete(nouvelUtilisateur._id);
      throw new Error("Échec de l'envoi de l'email de vérification.");
    }

    res.status(201).json({
      statut: "succes",
      token
    });
  } catch (err) {
    res.status(500).json({
      statut: "erreur",
      message: err.message
    });
  }
};

/* =====================================================
  ✅ CONNEXION
===================================================== */
exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        statut: "erreur",
        message: "Email et mot de passe requis."
      });
    }

    const utilisateur = await Utilisateur.findOne({ email }).select("+motDePasse");

    if (!utilisateur) {
      return res.status(401).json({
        statut: "erreur",
        message: "Email ou mot de passe incorrect."
      });
    }

    const correct = await utilisateur.verifierMotDePasse(motDePasse, utilisateur.motDePasse);

    if (!correct) {
      return res.status(401).json({
        statut: "erreur",
        message: "Email ou mot de passe incorrect."
      });
    }

    const token = creerToken(utilisateur._id);
    utilisateur.motDePasse = undefined;

    res.status(200).json({
      statut: "succes",
      token,
      donnees: { utilisateur }
    });

  } catch (err) {
    res.status(500).json({
      statut: "erreur",
      message: err.message
    });
  }
};

/* =====================================================
  ✅ MOT DE PASSE OUBLIÉ
===================================================== */
exports.motDePasseOublie = async (req, res) => {
  try {
    const { email } = req.body;

    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      return res.status(404).json({
        statut: "erreur",
        message: "Aucun utilisateur trouvé avec cet email."
      });
    }

    const tokenReinitialisation = crypto.randomBytes(32).toString("hex");

    res.status(200).json({
      statut: "succes",
      message: "Lien de réinitialisation envoyé.",
      tokenReinitialisation // ⚠️ À retirer en prod
    });
  } catch (err) {
    res.status(500).json({
      statut: "erreur",
      message: "Erreur lors de la demande de réinitialisation."
    });
  }
};
