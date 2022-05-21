const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const logger = require('../config/config').logger;

const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECRET;

const controller = {
	validateLogin(req, res, next) {
		const { emailAdress, password } = req.body;
		console.log(req.body);
		// Verify that we receive the expected input
		try {
			assert(
				typeof emailAdress === 'string',
				'EmailAdress must be a string'
			);
			assert(typeof password === 'string', 'Password must be a string');
			next();
		} catch (error) {
			res.status(400).json({
				status: 400,
				message: error.message,
				datetime: new Date().toISOString(),
			});
		}
	},

	validateToken(req, res, next) {
		logger.info('ValidateToken called');
		const authHeader = req.headers.authorization;

		logger.debug('ValidateToken called');

		if (!authHeader) {
			logger.warn('Authorization header missing');

			return res.status(401).json({
				status: 401,
				message: 'Authorization header missing',
				datetime: new Date().toISOString(),
			});
		}

		// Strip the word 'Bearer ' from the headervalue
		const token = authHeader.substring(7, authHeader.length);

		jwt.verify(token, jwtSecretKey, (err, payload) => {
			if (err) {
				logger.warn('Noth authorized');

				logger.warn('Not authorized');
				return res.status(401).json({
					status: 401,
					message: 'Not authorized',
					datetime: new Date().toISOString(),
				});
			}

			if (payload) {
				logger.debug('Token is valid');
				// User heeft toegang. Voeg UserId uit payload toe aan
				// request, voor ieder volgend endpoint.
				console.log(payload.userId);
				req.userId = payload.userId;

				next();
			}
		});
	},

	// Login
	login: (req, res) => {
		const { emailAdress, password } = req.body;

		logger.debug('Login called');

		dbconnection.getConnection(function (err, connection) {
			if (err) {
				logger.error('Error getting connection from dbconnection');

				return res.status(500).json({
					status: 500,
					result: err.toString(),
					datetime: new Date().toISOString(),
				});
			}

			// Use the connection
			connection.query(
				`SELECT id, emailAdress, password, firstName, lastName FROM user WHERE emailAdress = '${emailAdress}';`,
				function (error, results, fields) {
					// When done with the connection, release it.
					connection.release();

					// Don't use the connection here, it has been returned to the pool.
					// Handle error after the release.
					if (error) {
						logger.error('Error: ', err.toString());

						return res.status(500).json({
							status: 500,
							result: error.toString(),
							datetime: new Date().toISOString(),
						});
					}

					if (
						(results &&
							results.length == 1 &&
							password != results[0].password) ||
						results.length == 0
					) {
						logger.info('User not found or password invalid');

						return res.status(401).json({
							status: 401,
							message: 'User not found or password invalid',
							datetime: new Date().toISOString(),
						});
					}

					logger.info(
						'Passwords matches, sending userinfo and valid token'
					);

					const { ...userInfo } = results[0];
					const payload = {
						userId: userInfo.id,
					};

					jwt.sign(
						payload,
						jwtSecretKey,
						{ expiresIn: '12d' },
						function (err, token) {
							console.debug(
								'User logged in, sending: ',
								userInfo
							);
							res.status(200).json({
								status: 200,
								result: { ...userInfo, token },
							});
						}
					);
				}
			);
		});
	},
};

module.exports = controller;
