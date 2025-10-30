require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// Import des routes
const routesDestinations = require('./routes/destination');
const routesAuth = require('./routes/auth');
const routesReservations = require('./routes/reservation');
const path = require('path');

// Initialisation de l'application Express
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration des variables d'environnement
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tchad-voyages';

// Connexion à MongoDB
mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Connecté à la base de données MongoDB'))
.catch((err) => {
  console.error('❌ Erreur de connexion à MongoDB:', err);
  process.exit(1);
});

// Middleware de sécurité HTTP headers
app.use(helmet());

// Middleware pour parser les cookies
app.use(cookieParser());

// Middleware pour limiter le nombre de requêtes
const limiter = rateLimit({
  max: 100, // 100 requêtes
  windowMs: 60 * 60 * 1000, // par heure
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer dans une heure.'
});
app.use('/api', limiter);

// Middleware pour parser le corps des requêtes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Protection contre les attaques par injection NoSQL
app.use((req, res, next) => {
  // Ajout de la méthode sanitize à l'objet req
  req.sanitize = (value) => {
    if (typeof value === 'string') {
      // Supprime les caractères potentiellement dangereux
      return value.replace(/\$/g, '').replace(/\./g, '');
    }
    return value;
  };
  
  // Nettoyage des paramètres de requête
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = req.sanitize(req.query[key]);
    });
  }
  
  // Nettoyage du corps de la requête
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = req.sanitize(req.body[key]);
    });
  }
  
  next();
});

// Protection contre les attaques XSS (désactivée temporairement en raison d'un problème de compatibilité)
// app.use(xss());

// Protection contre la pollution des paramètres HTTP
app.use(hpp({
  whitelist: [
    'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
  ]
}));

// Middleware pour activer CORS
app.use(cors({
  origin: 'http://localhost:4200', // Remplacez par votre URL frontend
  credentials: true
}));

// Middleware de journalisation
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/destinations', routesDestinations);
app.use('/api/auth', routesAuth);
app.use('/api/reservations', routesReservations);

// Route de santé
app.get('/api/sante', (req, res) => {
  res.status(200).json({
    statut: 'succes',
    message: 'Serveur Tchad Voyages en ligne',
    horodatage: new Date().toISOString(),
    environnement: process.env.NODE_ENV || 'development'
  });
});

// Gestion des routes non trouvées (doit être la dernière route avant la gestion des erreurs)
app.use((req, res, next) => {
  const err = new Error(`Impossible de trouver ${req.originalUrl} sur ce serveur.`);
  err.status = 'fail';
  err.statusCode = 404;
  
  next(err);
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error('Erreur:', err);
  
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);  
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('ERREUR NON GÉRÉE! 💥 Arrêt...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Gestion des exceptions non capturées
process.on('uncaughtException', (err) => {
  console.error('ERREUR NON CAPTURÉE! 💥 Arrêt...');
  console.error(err.name, err.message);
  process.exit(1);
});
