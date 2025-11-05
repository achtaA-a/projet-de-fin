const express = require('express');
const router = express.Router();
const {
  inscription,
  connexion,
  motDePasseOublie,
} = require('../controllers/auth');

router.post('/inscription', inscription);
router.post('/connexion', connexion);
router.post('/motdepasse-oublie', motDePasseOublie);

module.exports = router;
 