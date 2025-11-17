// Chargement des variables d'environnement
require('dotenv').config();
console.log(" JWT_SECRET chargé :", process.env.JWT_SECRET ? " oui" : " non");

// Import des modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

//  Import des routes
const routesAuth = require('./routes/auth');
const routesDestinations = require('./routes/destination');
const routesReservations = require('./routes/reservation');
const routesContact = require('./routes/contact');
const routesAdmin = require('./routes/admin');


// Initialisation de l'application Express
const app = express();

//  Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    credentials: true,
  })
);
app.use(morgan('dev'));

//  Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  Connexion MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/tchad-voyages';

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(' Connecté à MongoDB'))
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB :', err.message);
    process.exit(1);
  });

// Gestion des erreurs MongoDB
mongoose.connection.on('error', (err) => {
  console.error(' Erreur MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log(' Déconnecté de MongoDB');
});

//  Routes principales
app.use('/api/auth', routesAuth);
app.use('/api/destinations', routesDestinations);
app.use('/api/reservations', routesReservations);
app.use('/api/contact', routesContact);
app.use('/api/admin', routesAdmin);

// 🩺 Route de test (vérifie que le serveur tourne)
app.get('/api/sante', (req, res) => {
  res.json({
    statut: 'succes',
    message: 'Serveur Tchad Voyages en ligne 🚀',
    timestamp: new Date().toISOString(),
    environnement: process.env.NODE_ENV || 'development',
  });
});

// ℹ️ Route info API
app.get('/api', (req, res) => {
  res.json({
    nom: 'Tchad Voyages API',
    version: '1.0.0',
    description: 'API de réservation de vols pour le Tchad',
    endpoints: {
      auth: '/api/auth',
      destinations: '/api/destinations',
      reservations: '/api/reservations',
      contact: '/api/contact',
    },
  });
});

//  Gestion des routes non trouvées (CORRECTIF EXPRESS 5)
app.use((req, res) => {
  res.status(404).json({
    statut: 'erreur',
    message: `Route non trouvée : ${req.originalUrl}`,
  });
});

//  Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(' Erreur non gérée:', err);

  res.status(err.status || 500).json({
    statut: 'erreur',
    message: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack,
    }),
  });
});

// 🏁 Démarrage du serveur
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(` Serveur démarré sur le port ${PORT}`);
  console.log(` Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(` URL: http://localhost:${PORT}`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\nArrêt du serveur...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\nArrêt du serveur (SIGTERM)...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

module.exports = app;
     