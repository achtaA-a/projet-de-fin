const express = require('express');
const controleurReservations = require('../controllers/reservation');

const routeur = express.Router();

// Routes ouvertes, sans authentification
routeur
  .route('/')
  .get(controleurReservations.obtenirReservations)
  .post(controleurReservations.creerReservation);

routeur
  .route('/:id')
  .get(controleurReservations.obtenirReservation)
  .put(controleurReservations.mettreAJourReservation) // Ajout de PUT
  .patch(controleurReservations.mettreAJourReservation) // Ajout de PATCH
  .delete(controleurReservations.supprimerReservation); // Ajout de DELETE

// Route pour récupérer par référence
routeur.get('/reference/:reference', controleurReservations.obtenirReservationParReference);

// Route pour les statistiques
routeur.get('/statistiques/chiffre-affaire', controleurReservations.obtenirStatistiques);

module.exports = routeur;