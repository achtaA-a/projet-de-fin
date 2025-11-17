const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { proteger, restreindreA } = require('../middlewares/auth');

// Toutes les routes admin nécessitent une authentification et le rôle admin
router.use(proteger);
router.use(restreindreA('admin'));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/activities', adminController.getRecentActivities);
router.get('/stats/advanced', adminController.getAdvancedStats);

// Gestion des utilisateurs
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);

// Gestion des vols
router.get('/vols', adminController.getVols);
router.post('/vols', adminController.createVol);

module.exports = router;