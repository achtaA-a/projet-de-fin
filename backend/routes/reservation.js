const express = require('express');
const reservationController = require('../controllers/reservation'); 
// ou ../controllers/reservationController selon TON fichier

const router = express.Router();

// Routes pour les réservations
router.route('/')
  .get(reservationController.obtenirReservations)
  .post(reservationController.creerReservation);

router.route('/:id')
  .get(reservationController.obtenirReservation)
  .put(reservationController.mettreAJourReservation)
  .patch(reservationController.mettreAJourReservation)
  .delete(reservationController.supprimerReservation);

// Route pour récupérer par référence
router.get('/reference/:reference', reservationController.obtenirReservationParReference);

// Route pour les statistiques
router.get('/statistiques/chiffre-affaire', reservationController.obtenirStatistiques);

// Route pour annuler une réservation
router.patch('/:id/annuler', reservationController.annulerReservation);

module.exports = router;
