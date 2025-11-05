const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Utilisateur = require('../models/usersModel');

// ✅ Vérifier si le secret JWT est bien défini
if (!process.env.JWT_SECRET) {
  console.error("❌ Erreur critique : JWT_SECRET n'est pas défini dans le fichier .env");
  process.exit(1);
}

// ✅ Fonction pour créer un token JWT
const creerToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

// ✅ INSCRIPTION
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
    } = req.body;

    if (!prenom || !nom || !email || !motDePasse) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Veuillez remplir tous les champs obligatoires.',
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Un utilisateur avec cet email existe déjà.',
      });
    }

    // Créer un nouvel utilisateur
    const nouvelUtilisateur = await Utilisateur.create({
      prenom,
      nom,
      email,
      motDePasse,
      telephone,
      dateNaissance,
      nationalite,
      numeroPasseport,
    });

    // Créer un token JWT
    const token = creerToken(nouvelUtilisateur._id);

    nouvelUtilisateur.motDePasse = undefined;

    res.status(201).json({
      statut: 'succes',
      token,
      donnees: { utilisateur: nouvelUtilisateur },
    });
  } catch (erreur) {
    res.status(500).json({
      statut: 'erreur',
      message: erreur.message,
    });
  }
};

// ✅ CONNEXION
exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Email et mot de passe requis.',
      });
    }

    const utilisateur = await Utilisateur.findOne({ email }).select('+motDePasse');
    if (!utilisateur || !(await utilisateur.verifierMotDePasse(motDePasse, utilisateur.motDePasse))) {
      return res.status(401).json({
        statut: 'erreur',
        message: 'Email ou mot de passe incorrect.',
      });
    }

    const token = creerToken(utilisateur._id);
    utilisateur.motDePasse = undefined;

    res.status(200).json({
      statut: 'succes',
      token,
      donnees: { utilisateur },
    });
  } catch (erreur) {
    res.status(500).json({
      statut: 'erreur',
      message: erreur.message,
    });
  }
};

// ✅ MOT DE PASSE OUBLIÉ
exports.motDePasseOublie = async (req, res) => {
  try {
    const { email } = req.body;
    const utilisateur = await Utilisateur.findOne({ email });

    if (!utilisateur) {
      return res.status(404).json({
        statut: 'erreur',
        message: 'Aucun utilisateur trouvé avec cet email.',
      });
    }

    const tokenReinitialisation = crypto.randomBytes(32).toString('hex');
    res.status(200).json({
      statut: 'succes',
      message: 'Lien de réinitialisation envoyé par email.',
      tokenReinitialisation, // ⚠️ À retirer en production
    });
  } catch (erreur) {
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la demande de réinitialisation.',
    });
  }
};
