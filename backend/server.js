// 🌍 Chargement des variables d'environnement
require('dotenv').config();
console.log("🔐 JWT_SECRET chargé :", process.env.JWT_SECRET ? "✅ oui" : "❌ non");

// 📦 Import des modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// 🧭 Import des routes
const routesAuth = require('./routes/auth');
const routesDestinations = require('./routes/destination');
const routesReservations = require('./routes/reservation');
const routesContact = require('./routes/contact');

// 🚀 Initialisation de l'application Express
const app = express();

// 🧩 Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(morgan('dev'));

// 🖼️ Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 💾 Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tchad-voyages';
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => {
    console.error('❌ Erreur de connexion à MongoDB :', err.message);
    process.exit(1);
  });

// 🛣️ Routes principales
app.use('/api/auth', routesAuth);
app.use('/api/destinations', routesDestinations);
app.use('/api/reservations', routesReservations);
app.use('/api/contact', routesContact);

// 🩺 Test du serveur
app.get('/api/sante', (req, res) => {
  res.json({
    statut: 'succes',
    message: 'Serveur Tchad Voyages en ligne 🚀',
  });
});

// 🏁 Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
