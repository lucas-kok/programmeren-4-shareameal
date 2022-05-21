const routes = require('express').Router();
const authController = require('../controllers/authentication.controller');

routes.post('/login', authController.validateLogin, authController.login);

module.exports = routes;
