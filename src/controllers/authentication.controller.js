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

			// Validating after making sure the email and password are strings
			// EmailAdress must be valid (found this regex online, not aware of all details)
			assert.match(
				emailAdress,
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'The emailAdress is not valid'
			);

			// Password contains 8-15 characters which contains at least one lower- and uppercase letter, one special character and one digit
			assert.match(
				password,
				/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
				'This password is not valid, please use at least 8 characters, one digit, one lower case and one upper case.'
			);

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
				`SELECT * FROM user WHERE emailAdress = '${emailAdress}';`,
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

						return res.status(404).json({
							status: 404,
							message: 'User not found or password invalid',
							datetime: new Date().toISOString(),
						});
					}

					logger.info(
						'Passwords matches, sending userinfo and valid token'
					);

					const userInfo = results[0];
					const payload = {
						userId: userInfo.id,
					};
					userInfo.isActive = userInfo.isActive == 1 ? true : false;

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
