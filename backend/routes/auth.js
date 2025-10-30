const express = require('express');
const controleurAuth = require('../controllers/auth');
const routeur = express.Router();

// Routes d'authentification
routeur.post('/inscription', controleurAuth.inscription);
routeur.post('/connexion', controleurAuth.connexion);
routeur.post('/mot-de-passe-oublie', controleurAuth.motDePasseOublie);

module.exports = routeur;