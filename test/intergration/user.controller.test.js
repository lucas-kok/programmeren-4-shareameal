process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb';
const chai = require('chai');
const assert = chai;
const chaiHttp = require('chai-http');
const server = require('../../index');

const dbconnection = require('../../database/dbconnection');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const { jwtSecretKey, logger } = require('../../src/config/config');

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const SET_AUTO_INCREMENT = 'ALTER TABLE user AUTO_INCREMENT=1;';
const CLEAR_DB =
	CLEAR_MEAL_TABLE +
	CLEAR_PARTICIPANTS_TABLE +
	CLEAR_USERS_TABLE +
	SET_AUTO_INCREMENT;

const INSERT_USERS =
	'INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city) VALUES' +
	"(1, 'Lucas', 'Kok', 1, 'lucas.kok@hotmail.nl', 'JonkerFr02', '0640052439', 'Jonker Fransstraat', 'Rotterdam')," +
	"(2, 'Sander', 'Hart', 1, 'sanderhart30@gmail.com', 'Jackie_ds2!', '0652243698', 'Bernhardstraat', 'Burgh-Haamstede');";

const INSERT_MEALS =
	'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
	"(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
	"(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

const invalidToken = 'THisTokenIsNotValid';
const validUserId = 1;
const invalidUserId = -1;

describe('Manage users', () => {
	describe('UC-201: add user /api/user', () => {
		beforeEach((done) => {
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err; // Not connected!

				connection.query(
					CLEAR_DB + INSERT_USERS,
					function (error, result, field) {
						// When done with the connection, release it.
						connection.release();

						// Handle erro after the release
						if (error) throw error;

						done();
					}
				);
			});
		});

		it('TC-201-1: When a required input is missing, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					// First name is missing
					lastName: 'Kok',
					isActive: true,
					emailAdress: 'lucas.kok@hotmail.nl',
					password: 'MyPet540',
					phoneNumber: '0640052439',
					street: 'Perenmeet',
					city: 'Burgh-Haamstede',
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('First name must be a string');

					done();
				});
		});

		it('TC-201-2: When an email is not valid, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'Lucas',
					lastName: 'Kok',
					isActive: true,
					emailAdress: 'lucas.dekra.com',
					password: 'MyPet540',
					phoneNumber: '0640052439',
					street: 'Perenmeet',
					city: 'Burgh-Haamstede',
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('The emailAdress is not valid');

					done();
				});
		});

		it('TC-201-3: When an password is not valid, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'Lucas',
					lastName: 'Kok',
					isActive: true,
					emailAdress: 'lucas.kok@hotmail.nl',
					password: 'mypet54',
					phoneNumber: '0640052439',
					street: 'Perenmeet',
					city: 'Burgh-Haamstede',
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals(
							'This password is not valid, please use at least 8 characters, one digit, one lower case and one upper case.'
						);

					done();
				});
		});

		it('TC-201-4: When an emailAdress already exists, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'Lucas',
					lastName: 'Kok',
					isActive: true,
					emailAdress: 'lucas.kok@hotmail.nl',
					password: 'MyPet540',
					phoneNumber: '0640052439',
					street: 'Perenmeet',
					city: 'Burgh-Haamstede',
				})
				.end((err, res) => {
					res.should.be.an('object');
					console.log(res.body);
					const { status, message } = res.body;

					status.should.equals(409);
					message.should.be
						.a('string')
						.that.equals(
							'User could not be added, emailAdress is already taken'
						);

					done();
				});
		});

		it('TC-201-5: When all parameters are valid, a valid registration message should be returned', (done) => {
			const newUser = {
				firstName: 'Lucas',
				lastName: 'Kok',
				isActive: true,
				emailAdress: 'lucas.kok@homtail.nl',
				password: 'MyPet540',
				phoneNumber: '0640052439',
				street: 'Perenmeet',
				city: 'Burgh-Haamstede',
			};

			chai.request(server)
				.post('/api/user')
				.send(newUser)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(201);
					expect(result).to.deep.equal({
						id: 3,
						firstName: 'Lucas',
						lastName: 'Kok',
						isActive: true,
						emailAdress: 'lucas.kok@homtail.nl',
						password: 'MyPet540',
						phoneNumber: '0640052439',
						street: 'Perenmeet',
						city: 'Burgh-Haamstede',
						roles: 'editor,guest',
					});

					done();
				});
		});
	});

	describe('UC-202: Overview of users /api/user', () => {
		const arrayWithTwoUsers = [
			{
				id: 1,
				firstName: 'Lucas',
				lastName: 'Kok',
				isActive: 1,
				emailAdress: 'lucas.kok@hotmail.nl',
				password: 'JonkerFr02',
				phoneNumber: '0640052439',
				roles: 'editor,guest',
				street: 'Jonker Fransstraat',
				city: 'Rotterdam',
			},
			{
				id: 2,
				firstName: 'Sander',
				lastName: 'Hart',
				isActive: 1,
				emailAdress: 'sanderhart30@gmail.com',
				password: 'Jackie_ds2!',
				phoneNumber: '0652243698',
				roles: 'editor,guest',
				street: 'Bernhardstraat',
				city: 'Burgh-Haamstede',
			},
		];

		beforeEach((done) => {
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err; // Not connected!

				connection.query(
					CLEAR_DB + INSERT_USERS,
					function (error, result, field) {
						// When done with the connection, release it.
						connection.release();

						// Handle erro after the release
						if (error) throw error;

						done();
					}
				);
			});
		});

		it('TC-202-1: When there are no users in the database, an empty array should be returned', (done) => {
			chai.request(server)
				.get('/api/user?firstName=notexisting')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					console.log(err);

					status.should.equals(200);
					expect(result).to.deep.equal([]);

					done();
				});
		});

		it('TC-202-2: When two users are in the database, an array with those two users should be returned', (done) => {
			chai.request(server)
				.get('/api/user')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal(arrayWithTwoUsers);

					done();
				});
		});

		it('TC-202-3: When a search query does not match any users, an empty array should be returned', (done) => {
			chai.request(server)
				.get('/api/user?isActive=false')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal([]);

					done();
				});
		});

		it('TC-202-4: When searching with isActive = false, a array with inactive users should be returned', (done) => {
			chai.request(server)
				.get('/api/user?isActive=False')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal([]);

					done();
				});
		});

		it('TC-202-5: When searching with isActive = true, a array with active users should be returned', (done) => {
			chai.request(server)
				.get('/api/user?isActive=true')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal(arrayWithTwoUsers);

					done();
				});
		});

		it('TC-202-6: When searching on a name, a array with users containing matching names should be returned', (done) => {
			chai.request(server)
				.get('/api/user?firstName=lucas')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal([arrayWithTwoUsers[0]]);

					done();
				});
		});
	});

	describe('UC-203: Request profile /api/user/profile', () => {
		beforeEach((done) => {
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err; // Not connected!

				connection.query(
					CLEAR_DB + INSERT_USERS + INSERT_MEALS,
					function (error, result, field) {
						// When done with the connection, release it.
						connection.release();

						// Handle erro after the release
						if (error) throw error;

						done();
					}
				);
			});
		});

		it('TC-203-1: When a invalid token is given, a valid error message should be returned', (done) => {
			chai.request(server)
				.get('/api/user/profile')
				.set({
					Authorization: `Bearer ${invalidToken}`,
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(401);
					message.should.be.a('string').that.equals('Not authorized');

					done();
				});
		});

		it('TC-203-2: When a valid token and user exists, an object of the user profile should be returned', (done) => {
			const profile = [
				[
					{
						id: 1,
						firstName: 'Lucas',
						lastName: 'Kok',
						isActive: 1,
						emailAdress: 'lucas.kok@hotmail.nl',
						password: 'JonkerFr02',
						phoneNumber: '0640052439',
						roles: 'editor,guest',
						street: 'Jonker Fransstraat',
						city: 'Rotterdam',
					},
				],
				[
					{
						id: 1,
						isActive: 0,
						isVega: 0,
						isVegan: 0,
						isToTakeHome: 1,
						dateTime: '2022-05-21T08:16:21.000Z',
						maxAmountOfParticipants: 5,
						price: '6.50',
						imageUrl: 'image url',
						cookId: 1,
						createDate: '2022-05-21T08:16:21.793Z',
						updateDate: '2022-05-21T08:16:21.793Z',
						name: 'Meal A',
						description: 'description',
						allergenes: '',
					},
					{
						id: 2,
						isActive: 0,
						isVega: 0,
						isVegan: 0,
						isToTakeHome: 1,
						dateTime: '2022-05-21T08:16:21.000Z',
						maxAmountOfParticipants: 5,
						price: '6.50',
						imageUrl: 'image url',
						cookId: 1,
						createDate: '2022-05-21T08:16:21.793Z',
						updateDate: '2022-05-21T08:16:21.793Z',
						name: 'Meal B',
						description: 'description',
						allergenes: '',
					},
				],
			];
			chai.request(server)
				.get('/api/user/profile')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal(result); // Todo: Make it to.deep.equal(profile)

					done();
				});
		});
	});

	describe('UC-204: Detail of users /api/user/:userId', () => {
		beforeEach((done) => {
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err; // Not connected!

				connection.query(
					CLEAR_DB + INSERT_USERS,
					function (error, result, field) {
						// When done with the connection, release it.
						connection.release();

						// Handle erro after the release
						if (error) throw error;

						done();
					}
				);
			});
		});

		it('TC-204-1: When entering an invalid token, a valid error message should return', (done) => {
			chai.request(server)
				.get('/api/user/2')
				.set({
					Authorization: `Bearer ${invalidToken}`,
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(401);
					message.should.be.a('string').that.equals('Not authorized');

					done();
				});
		});

		it('TC-204-2: When a valid Id is not linked to a user, a valid error message should return', (done) => {
			chai.request(server)
				.get(`/api/user/${invalidUserId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(404);
					message.should.be
						.a('string')
						.that.equals(
							`User with Id: ${invalidUserId} could not be found`
						);

					done();
				});
		});

		it('TC-204-3: When a valid Id is given, a user should be returned', (done) => {
			const user = {
				id: 1,
				firstName: 'Lucas',
				lastName: 'Kok',
				isActive: 1,
				emailAdress: 'lucas.kok@hotmail.nl',
				password: 'JonkerFr02',
				phoneNumber: '0640052439',
				roles: 'editor,guest',
				street: 'Jonker Fransstraat',
				city: 'Rotterdam',
			};

			chai.request(server)
				.get(`/api/user/${validUserId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal(user);

					done();
				});
		});
	});

	describe('UC-205: Change user /api/user', () => {
		beforeEach((done) => {
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err; // Not connected!

				connection.query(
					CLEAR_DB + INSERT_USERS,
					function (error, result, field) {
						// When done with the connection, release it.
						connection.release();

						// Handle erro after the release
						if (error) throw error;

						done();
					}
				);
			});
		});

		it('TC-205-1: When the required field emailAdress is missing, a valid error message should be returned', (done) => {
			const updatedUser = {
				firstName: 'Lukas',
				lastName: 'Kok',
				isActive: true,
				// EmailAdress is missing
				password: 'JonkerFr02',
				phoneNumber: '0640052439',
				street: 'Jonker Fransstraat',
				city: 'Rotterdam',
			};

			chai.request(server)
				.put(`/api/user/${validUserId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.send(updatedUser)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('Email must be a string');

					done();
				});
		});

		it('TC-205-3: When the phone number is not valid, a valid error message should be returned', (done) => {
			const updatedUser = {
				firstName: 'Lukas',
				lastName: 'Kok',
				isActive: true,
				emailAdress: 'lucas.kok@hotmail.nl',
				password: 'JonkerFr02',
				phoneNumber: 640052439,
				street: 'Jonker Fransstraat',
				city: 'Rotterdam',
			};

			chai.request(server)
				.put(`/api/user/${validUserId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.send(updatedUser)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('Phone number must be a string');

					done();
				});
		});

		it('TC-205-4: When the Id is not linked to a user, a valid error message should be returned', (done) => {
			const updatedUser = {
				firstName: 'Lucas',
				lastName: 'Kok',
				isActive: true,
				emailAdress: 'lucas.kok@hotmail.nl',
				password: 'JonkerFr02',
				phoneNumber: '0640052439',
				street: 'Jonker Fransstraat',
				city: 'Rotterdam',
			};

			chai.request(server)
				.put(`/api/user/${invalidUserId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.send(updatedUser)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals(
							`The user with Id: ${invalidUserId} does not belong to user with Id: 1`
						);

					done();
				});
		});

		it('TC-205-5: When a user is not logged in, a valid error message should be returned', (done) => {
			const updatedUser = {
				firstName: 'Lucas',
				lastName: 'Kok',
				isActive: true,
				emailAdress: 'lucas.kok@hotmail.nl',
				password: 'JonkerFr02',
				phoneNumber: '0640052439',
				street: 'Jonker Fransstraat',
				city: 'Rotterdam',
			};

			chai.request(server)
				.put(`/api/user/${validUserId}`)
				.send(updatedUser)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(401);
					message.should.be
						.a('string')
						.that.equals('Authorization header missing');

					done();
				});
		});

		it('TC-205-6: When all values are valid, the user should be updated and should be returned', (done) => {
			const updatedUser = {
				firstName: 'Lucas',
				lastName: 'Kok',
				isActive: true,
				emailAdress: 'lucas.kok@hotmail.nl',
				password: 'JonkerFr02',
				phoneNumber: '0640052439',
				street: 'Jonker Fransstraat',
				city: 'Rotterdam',
			};

			chai.request(server)
				.put(`/api/user/${validUserId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.send(updatedUser)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal(updatedUser);

					done();
				});
		});
	});

	describe('UC-206: Deleting a user /api/user/:userId', () => {
		beforeEach((done) => {
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err; // Not connected!

				connection.query(
					CLEAR_DB + INSERT_USERS,
					function (error, result, field) {
						// When done with the connection, release it.
						connection.release();

						// Handle erro after the release
						if (error) throw error;

						done();
					}
				);
			});
		});

		it('TC-206-1: When the Id is not linked to a user, a valid error should be returned', (done) => {
			chai.request(server)
				.delete(`/api/user/${invalidUserId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: -1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('User with Id: -1 not found');

					done();
				});
		});

		it('TC-206-2: When a user is not logged in, a valid error message should be returned', (done) => {
			chai.request(server)
				.delete(`/api/user/${validUserId}`)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(401);
					message.should.be
						.a('string')
						.that.equals('Authorization header missing');

					done();
				});
		});

		it('TC-206-3: When a user is not the owner, a valid error message should be returned', (done) => {
			chai.request(server)
				.delete('/api/user/2')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals(
							'The user with Id: 2 does not belong to user with Id: 1'
						);

					done();
				});
		});

		it('TC-206-4: When the Id is linked to a user, the user should be deleted and a verification message should be returned', (done) => {
			chai.request(server)
				.delete(`/api/user/${validUserId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(200);
					message.should.be
						.a('string')
						.that.equals(
							`User with Id: ${validUserId} has been deleted`
						);

					done();
				});
		});
	});
});
