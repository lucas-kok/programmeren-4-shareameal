const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const logger = require('../config/config').logger;
const controller = {
	validateUser: (req, res, next) => {
		const user = req.body;
		const {
			firstName,
			lastName,
			isActive,
			emailAdress,
			password,
			phoneNumber,
			street,
			city,
		} = user;

		try {
			assert(
				typeof firstName === 'string',
				'First name must be a string'
			);
			assert(typeof lastName === 'string', 'Last name must be a string');
			assert(typeof isActive === 'boolean', 'IsActive must be a boolean');
			assert(typeof emailAdress === 'string', 'Email must be a string');
			assert(typeof password === 'string', 'Password must be a string');
			assert(
				typeof phoneNumber === 'string',
				'Phone number must be a string'
			);
			assert(typeof street === 'string', 'Street must be a string');
			assert(typeof city === 'string', 'City must be a string');

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

			// Regex for valid dutch phonenumber
			assert.match(
				phoneNumber,
				/(^\+[0-9]{2}|^\+[0-9]{2}\(0\)|^\(\+[0-9]{2}\)\(0\)|^00[0-9]{2}|^0)([0-9]{9}$|[0-9\-\s]{10}$)/,
				'Phonenumber must be 10 digits long, example: 0612345678'
			);

			next();
		} catch (error) {
			const selectiveErrorInformation = {
				status: 400,
				message: error.message,
			};

			next(selectiveErrorInformation);
		}
	},

	// UC-201: Register a new user
	addUser: (req, res) => {
		const user = req.body;
		const {
			firstName,
			lastName,
			isActive,
			emailAdress,
			password,
			phoneNumber,
			street,
			city,
		} = user;
		const isActiveNumber = isActive ? 1 : 0;

		logger.debug('AddUser called');

		dbconnection.getConnection(function (err, connection) {
			if (err) throw err; // Not connected!

			// Use the connection
			connection.query(
				`INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city) VALUES ('${firstName}', '${lastName}', ${isActiveNumber}, '${emailAdress}', '${password}', '${phoneNumber}', '${street}', '${city}');`,
				function (error, results, fields) {
					// Handle error
					if (error) {
						return res.status(409).json({
							status: 409,
							message: `User could not be added, emailAdress is already taken`,
						});
					}

					logger.debug('User succesfully created');

					// Retrieving the full user from the database
					connection.query(
						`SELECT * FROM user WHERE emailAdress = '${emailAdress}'`,
						function (error, results, fields) {
							// When done with the connection, release it
							connection.release();

							// Handle error after the release
							if (error) throw error;

							// Don't use the connection here, it has been returned to the pool
							// Returning when no records are found
							if (results.length <= 0) {
								console.debug(
									`User with emailAdress: ${emailAdress} could not be found`
								);

								return res.status(404).json({
									status: 404,
									message: `User with emailAdress: ${emailAdress} could not be found`,
								});
							}

							const newUser = results[0];
							newUser.isActive = isActive == 1 ? true : false;

							logger.debug(newUser);

							res.status(201).json({
								status: 201,
								result: newUser,
							});
						}
					);
				}
			);
		});
	},

	// UC-202: Get all users
	getAllUsers: (req, res) => {
		const queryParams = req.query;
		const { firstName, isActive } = queryParams;

		logger.debug(
			`GetAllUsers called, name: ${firstName} & isActive: ${isActive}`
		);

		// Building the query string based on the input
		let queryString = 'SELECT * FROM user';
		if (firstName || isActive) {
			queryString += ' WHERE ';

			if (firstName) {
				queryString += `firstName = '${firstName}'`;

				if (isActive) {
					queryString += ' AND ';
				}
			}

			if (isActive) {
				queryString += 'isActive = ';
				queryString += isActive == 'true' ? '1' : '0';
			}
		}
		queryString += ';';

		logger.debug(`Query: ${queryString}`);

		dbconnection.getConnection(function (err, connection) {
			if (err) throw err; // Not connected!

			// Use the connection
			connection.query(queryString, function (error, results, fields) {
				// When done with the connection, release it.
				connection.release();

				// Handle error after the release.
				if (error) throw error;

				// Don't use the connection here, it has been returned to the pool.
				logger.debug(`#results: ${results.length}`);

				results.forEach((result) => {
					result.isActive = result.isActive == 1 ? true : false;
				});

				res.status(200).json({
					status: 200,
					result: results,
				});
			});
		});
	},

	// UC-203: Request personal user profile
	getPersonalUser: (req, res) => {
		const userId = req.userId;

		logger.debug(`GetUser called with Id: ${userId}`);

		if (isNaN(userId)) {
			logger.warn('Id must be a number');

			return res.status(401).json({
				status: 401,
				result: 'Id must be a number',
			});
		}

		dbconnection.getConnection(function (err, connection) {
			if (err) throw err; // Not connected!

			// Use the connection
			connection.query(
				`SELECT * FROM user where id = ${userId};`,
				function (error, results, fields) {
					// When done with the connection, release it.
					connection.release();

					// Handle error after the release.
					if (error) throw error;

					// Don't use the connection here, it has been returned to the pool.
					// Returning when no records are found
					if (results.length <= 0) {
						console.debug(
							`User with Id: ${userId} could not be found`
						);

						return res.status(404).json({
							status: 404,
							message: `User with Id: ${userId} could not be found`,
						});
					}

					logger.debug(results);

					res.status(200).json({
						status: 200,
						result: results[0],
					});
				}
			);
		});
	},

	// UC-204: Get single user by ID
	getUser: (req, res) => {
		const userId = req.params.userId;

		logger.debug(`GetUser called with Id: ${userId}`);

		if (isNaN(userId)) {
			logger.warn('Id must be a number');

			return res.status(401).json({
				status: 401,
				result: 'Id must be a number',
			});
		}

		dbconnection.getConnection(function (err, connection) {
			if (err) throw err; // Not connected!

			// Use the connection
			connection.query(
				`SELECT * FROM user where id = ${userId};`,
				function (error, results, fields) {
					// When done with the connection, release it.
					connection.release();

					// Handle error after the release.
					if (error) throw error;

					// Don't use the connection here, it has been returned to the pool.
					// Returning when no records are found
					if (results.length <= 0) {
						console.debug(
							`User with Id: ${userId} could not be found`
						);

						return res.status(404).json({
							status: 404,
							message: `User with Id: ${userId} could not be found`,
						});
					}

					const user = results[0];

					logger.debug(user);

					res.status(200).json({
						status: 200,
						result: user,
					});
				}
			);
		});
	},

	// UC-205: Update a single user
	updateUser: (req, res) => {
		const userId = req.params.userId;
		const userIdFromRequest = req.userId;
		const user = req.body;
		const {
			firstName,
			lastName,
			emailAdress,
			password,
			phoneNumber,
			street,
			city,
		} = user;

		logger.debug(`UpdateUser called with Id: ${userId}`);

		// Account may only be deleted when the request comes from the owner
		if (userId != userIdFromRequest) {
			logger.warn(
				`The user with Id: ${userId} does not not belong to user with Id: ${userIdFromRequest}`
			);

			return res.status(400).json({
				status: 403,
				message: `The user with Id: ${userId} does not belong to user with Id: ${userIdFromRequest}`,
			});
		}

		dbconnection.getConnection(function (err, connection) {
			if (err) throw err; // Not connected!

			// Use the connection
			connection.query(
				`UPDATE user SET firstName = '${firstName}', lastName = '${lastName}', emailAdress = '${emailAdress}', password = '${password}', phoneNumber = '${phoneNumber}', street = '${street}', city = '${city}' WHERE id = '${userId}';`,
				function (error, results, fields) {
					// When done with the connection, release it.
					connection.release();

					// Handle error after the release.
					if (error) {
						logger.debug(
							'User could not be added, emailAdress is already taken'
						);

						return res.status(401).json({
							status: 401,
							result: `User could not be added, emailAdress is already taken`,
						});
					}

					// Don't use the connection here, it has been returned to the pool.
					// Returning when no records are found
					if (results.affectedRows == 0) {
						logger.debug(`User with Id ${userId} not found`);

						return res.status(400).json({
							status: 400,
							result: `User with Id: ${userId} not found`,
						});
					}

					logger.debug(`User with id ${userId} sucesfully updated`);

					res.status(200).json({
						status: 200,
						result: user,
					});
				}
			);
		});
	},

	// UC-206: Delete a user
	deleteUser: (req, res) => {
		const userId = req.params.userId;
		const userIdFromRequest = req.userId;

		logger.debug(`DeleteUser called with Id: ${userId}`);

		dbconnection.getConnection(function (err, connection) {
			if (err) throw err; // Not connected!

			// Use the connection
			connection.query(
				`DELETE FROM user WHERE id = ${userId};`,
				function (error, results, fields) {
					// When done with the connection, release it.
					connection.release();

					// Handle error after the release.
					if (error) throw error;

					// Don't use the connection here, it has been returned to the pool.
					// Returning when no records are found
					if (results.affectedRows == 0) {
						logger.debug(`User with Id: ${userId} not found`);

						return res.status(400).json({
							status: 400,
							message: `User with Id: ${userId} not found`,
						});
					}

					// Account may only be deleted when the request comes from the owner
					if (userId != userIdFromRequest) {
						logger.warn(
							`The user with Id: ${userId} does not not belong to user with Id: ${userIdFromRequest}`
						);

						return res.status(403).json({
							status: 403,
							message: `The user with Id: ${userId} does not belong to user with Id: ${userIdFromRequest}`,
						});
					}

					logger.debug(`User with Id: ${userId} has been deleted`);

					res.status(200).json({
						status: 200,
						message: `User with Id: ${userId} has been deleted`,
					});
				}
			);
		});
	},
};

module.exports = controller;
