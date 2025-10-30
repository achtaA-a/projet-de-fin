const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/usersModel');
const crypto = require('crypto');

const creerToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

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
      numeroPasseport
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer le nouvel utilisateur
    const nouvelUtilisateur = await Utilisateur.create({
      prenom,
      nom,
      email,
      motDePasse,
      telephone,
      dateNaissance,
      nationalite,
      numeroPasseport
    });

    // Générer le token JWT
    const token = creerToken(nouvelUtilisateur._id);

    // Retirer le mot de passe de la réponse
    nouvelUtilisateur.motDePasse = undefined;

    res.status(201).json({
      statut: 'succes',
      token,
      donnees: {
        utilisateur: nouvelUtilisateur
      }
    });
  } catch (erreur) {
    res.status(400).json({
      statut: 'erreur',
      message: erreur.message
    });
  }
};

exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérifier si l'email et le mot de passe existent
    if (!email || !motDePasse) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Email et mot de passe requis'
      });
    }

    // Vérifier si l'utilisateur existe et le mot de passe est correct
    const utilisateur = await Utilisateur.findOne({ email }).select('+motDePasse');
    
    if (!utilisateur || !(await utilisateur.verifierMotDePasse(motDePasse, utilisateur.motDePasse))) {
      return res.status(401).json({
        statut: 'erreur',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Si tout est ok, envoyer le token
    const token = creerToken(utilisateur._id);
    utilisateur.motDePasse = undefined;

    res.status(200).json({
      statut: 'succes',
      token,
      donnees: {
        utilisateur
      }
    });
  } catch (erreur) {
    res.status(400).json({
      statut: 'erreur',
      message: erreur.message
    });
  }
};

exports.motDePasseOublie = async (req, res) => {
  try {
    const { email } = req.body;

    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      return res.status(404).json({
        statut: 'erreur',
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    }

    // Générer un token de réinitialisation
    const tokenReinitialisation = crypto.randomBytes(32).toString('hex');
    
    // En production, vous enverriez un email avec le lien de réinitialisation
    
    res.status(200).json({
      statut: 'succes',
      message: 'Lien de réinitialisation envoyé par email',
      tokenReinitialisation // À retirer en production
    });
  } catch (erreur) {
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la demande de réinitialisation'
    });
  }
};