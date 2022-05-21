const routes = require('express').Router();
const authController = require('../controllers/authentication.controller');

routes.post('/auth/login', authController.validateLogin, authController.login);

module.exports = routes;
