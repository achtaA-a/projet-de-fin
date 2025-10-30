const express = require('express');
const controleurReservations = require('../controllers/reservation');

const routeur = express.Router();

// Routes ouvertes, sans authentification
routeur
  .route('/')
  .get(controleurReservations.obtenirReservations) // ← fonction correcte
  .post(controleurReservations.creerReservation);

routeur
  .route('/:id')
  .get(controleurReservations.obtenirReservation);

module.exports = routeur;
