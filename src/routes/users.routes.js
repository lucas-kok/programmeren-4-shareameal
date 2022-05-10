const express = require('express');
const app = express();
const router = express.Router();
const userController = require('../controllers/user.controller');

// Test request
router.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        result: 'Hello World',
    });
});

// --------------------------------- Begin API User ----------------------------------- //

// Adding a new user
router.post('/api/user', userController.validateMovie, userController.addUser);

// Get all users
router.get('/api/user', userController.getAllUsers);

// Get user with id
router.get('/api/user/:userId', userController.getUserWithId);

// Deleting all users
router.delete('/api/user', userController.deleteAllUsers);

// Deleting a user with id
router.delete('/api/user/:userId', userController.deleteUserWithId);

// --------------------------------- End API User ----------------------------------- //

module.exports = router;