const routes = require('express').Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/authentication.controller');

// Test request
routes.get('/', (req, res) => {
	res.status(200).json({
		status: 200,
		result: 'Hello World',
	});
});

// --------------------------------- Begin API User ----------------------------------- //

// UC-201: Register a new user
routes.post('/user', userController.validateUser, userController.addUser);

// UC-202: Get all users
routes.get('/user', authController.validateToken, userController.getAllUsers);

// UC-203: Request personal user profile
routes.get(
	'/user/profile/:token',
	authController.validateToken,
	userController.getPersonalUser
);

// UC-204: Get single user by ID
routes.get(
	'/user/:userId',
	authController.validateToken,
	userController.getUserWithId
);

// UC-205: Update a single user
routes.post(
	'/user/:userId',
	authController.validateToken,
	userController.validateUser,
	userController.updateUser
);

// UC-206: Delete a user
routes.delete(
	'/user/:userId',
	authController.validateToken,
	userController.deleteUserWithId
);

// --------------------------------- End API User ----------------------------------- //

module.exports = routes;
