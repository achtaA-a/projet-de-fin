const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/usersModel');

exports.protection = async (req, res, next) => {
  try {
    let token;

    // Vérifier si le token est présent dans les headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        statut: 'erreur',
        message: 'Accès non autorisé. Veuillez vous connecter.'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier si l'utilisateur existe toujours
    const utilisateurActuel = await Utilisateur.findById(decoded.id);
    if (!utilisateurActuel) {
      return res.status(401).json({
        statut: 'erreur',
        message: "L'utilisateur n'existe plus."
      });
    }

    // Ajouter l'utilisateur à la requête
    req.utilisateur = utilisateurActuel;
    next();
  } catch (erreur) {
    return res.status(401).json({
      statut: 'erreur',
      message: 'Token invalide'
    });
  }
};