const routes = require('express').Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');

// UC-301: Create a meal
routes.post(
	'/meal',
	authController.validateToken,
	mealController.validateMeal,
	mealController.addMeal
);

// UC-302: Update a meal
routes.post(
	'/meal/:mealId',
	authController.validateToken,
	mealController.validateMeal,
	mealController.updateMeal
);

// UC-303: Request list of meals
routes.get('/meal', authController.validateToken, mealController.getAllMeals);

// UC-304: Request details of meal
routes.get(
	'/meal/:mealId',
	authController.validateToken,
	mealController.getMeal
);

// UC-305: Delete meal
routes.delete(
	'/meal/:mealId',
	authController.validateToken,
	mealController.deleteMeal
);

// UC-401 & UC-402: Participating and Siging off for a meal
routes.get(
	'/meal/:mealId/participate',
	authController.validateToken,
	mealController.manageParticipation
);

module.exports = routes;
