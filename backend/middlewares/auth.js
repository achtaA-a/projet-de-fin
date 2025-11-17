const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/usersModel');

exports.proteger = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        statut: 'erreur',
        message: 'Accès non autorisé. Token manquant.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const utilisateur = await Utilisateur.findById(decoded.id).select('-motDePasse');
    
    if (!utilisateur) {
      return res.status(401).json({
        statut: 'erreur',
        message: 'Token invalide. Utilisateur non trouvé.'
      });
    }

    if (!utilisateur.estActif) {
      return res.status(401).json({
        statut: 'erreur',
        message: 'Compte désactivé.'
      });
    }

    req.utilisateur = utilisateur;
    next();
  } catch (erreur) {
    console.error('Erreur authentification:', erreur);
    return res.status(401).json({
      statut: 'erreur',
      message: 'Token invalide.'
    });
  }
};

// Version corrigée du middleware restreindreA
exports.restreindreA = (...roles) => {
  return (req, res, next) => {
    if (!req.utilisateur || !roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        statut: 'erreur',
        message: 'Accès non autorisé. Permissions insuffisantes.'
      });
    }
    next();
  };
};

// Alternative plus simple si vous avez des problèmes avec restreindreA
exports.estAdmin = (req, res, next) => {
  if (!req.utilisateur || req.utilisateur.role !== 'admin') {
    return res.status(403).json({
      statut: 'erreur',
      message: 'Accès réservé aux administrateurs.'
    });
  }
  next();
};