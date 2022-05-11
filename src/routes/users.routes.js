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

// UC-201: Register a new user
router.post('/user', userController.validateUser, userController.addUser);

// UC-202: Get all users
router.get('/user', userController.getAllUsers);

// UC-203: Request personal user profile
router.get('/user/profile/:token', userController.getPersonalUser);

// UC-204: Get single user by ID
router.get('/user/:userId', userController.getUserWithId);

// UC-205: Update a single user
router.post(
	'/user/:userId',
	userController.validateUser,
	userController.updateUser
);

// UC-206: Delete a user
router.delete('/user/:userId', userController.deleteUserWithId);

// --------------------------------- End API User ----------------------------------- //

module.exports = router;
