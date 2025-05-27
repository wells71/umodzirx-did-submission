const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Admin user management routes
router.post('/users', UserController.addUser);
router.get('/users', UserController.getUsers);
router.get('/users/:digitalID', UserController.getUserById);
router.put('/users/:digitalID', UserController.updateUser);
router.delete('/users/:digitalID', UserController.deleteUser);

module.exports = router;