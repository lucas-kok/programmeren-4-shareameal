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
	"(1, 'Lucas', 'Kok', 1, 'lucas.kok@hotmail.nl', 'JonkerFr02_', '0640052439', 'Jonker Fransstraat', 'Rotterdam')," +
	"(2, 'Sander', 'Hart', 1, 'sanderhart30@gmail.com', 'Jackie_ds2!', '0652243698', 'Bernhardstraat', 'Burgh-Haamstede');";

const INSERT_MEALS =
	'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
	"(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
	"(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

const INSERT_PARTICIPATION =
	'INSERT INTO `meal_participants_user` (`mealId`, `userId`) VALUES (1, 1);';

const validMealId = 1;
const invalidMealId = -1;

describe('Manage meals', () => {
	describe('UC-301: Add meal /api/meal', () => {
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

		it('TC-301-1: When a required input is missing, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/meal')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.send({
					// name is missing
					description:
						'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
					isActive: true,
					isVega: false,
					isVegan: true,
					isToTakeHome: true,
					dateTime: '2022-05-17T08:27:15.000Z',
					imageUrl:
						'https://img3.restameta.com/950/288/4938944649502884.jpg',
					allergenes: ['noten'],
					maxAmountOfParticipants: 12,
					price: 420.69,
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('Name must be a string');

					done();
				});
		});

		it('TC-301-2: When a user is not signed in, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/meal')
				.send({
					name: 'Broodje krokante kip',
					description:
						'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
					isActive: true,
					isVega: false,
					isVegan: true,
					isToTakeHome: true,
					dateTime: '2022-05-17T08:27:15.000Z',
					imageUrl:
						'https://img3.restameta.com/950/288/4938944649502884.jpg',
					allergenes: ['noten'],
					maxAmountOfParticipants: 12,
					price: 420.69,
				})
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

		it('TC-301-3: When all parameters are valid, a valid registration message should be returned', (done) => {
			const newMeal = {
				name: 'Broodje krokante kip',
				description:
					'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
				isActive: true,
				isVega: false,
				isVegan: true,
				isToTakeHome: true,
				dateTime: '2022-05-17T08:27:15.000Z',
				imageUrl:
					'https://img3.restameta.com/950/288/4938944649502884.jpg',
				allergenes: ['noten'],
				maxAmountOfParticipants: 12,
				price: 420.69,
			};

			chai.request(server)
				.post('/api/meal')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.send(newMeal)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					console.log(res.body);

					status.should.equals(201);
					expect(result).to.deep.equal({
						id: result.id,
						cookId: 1,
						name: 'Broodje krokante kip',
						description:
							'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
						isActive: true,
						isVega: false,
						isVegan: true,
						isToTakeHome: true,
						dateTime: result.dateTime,
						imageUrl:
							'https://img3.restameta.com/950/288/4938944649502884.jpg',
						allergenes: ['noten'],
						maxAmountOfParticipants: 12,
						price: 420.69,
						createDate: result.createDate,
						updateDate: result.updateDate,
					});

					done();
				});
		});
	});

	describe('UC-302: Update meal /api/meal/:mealId', () => {
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

		it('TC-302-1: When a required input is missing, a valid error should be returned', (done) => {
			chai.request(server)
				.put(`/api/meal/${validMealId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.send({
					// name is missing
					description:
						'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
					isActive: true,
					isVega: false,
					isVegan: true,
					isToTakeHome: true,
					dateTime: '2022-05-17T08:27:15.000Z',
					imageUrl:
						'https://img3.restameta.com/950/288/4938944649502884.jpg',
					allergenes: ['noten'],
					maxAmountOfParticipants: 12,
					price: 420.69,
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('Name must be a string');

					done();
				});
		});

		it('TC-302-2: When a user is not signed in, a valid error should be returned', (done) => {
			chai.request(server)
				.put(`/api/meal/${validMealId}`)
				.send({
					name: 'Broodje krokante kip',
					description:
						'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
					isActive: true,
					isVega: false,
					isVegan: true,
					isToTakeHome: true,
					dateTime: '2022-05-17T08:27:15.000Z',
					imageUrl:
						'https://img3.restameta.com/950/288/4938944649502884.jpg',
					allergenes: ['noten'],
					maxAmountOfParticipants: 12,
					price: 420.69,
				})
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

		it('TC-302-3: When the user doesn not own the meal, a valid error should be returned', (done) => {
			chai.request(server)
				.put(`/api/meal/${validMealId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 3 }, jwtSecretKey),
				})
				.send({
					name: 'Broodje krokante kip',
					description:
						'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
					isActive: true,
					isVega: false,
					isVegan: true,
					isToTakeHome: true,
					dateTime: '2022-05-17T08:27:15.000Z',
					imageUrl:
						'https://img3.restameta.com/950/288/4938944649502884.jpg',
					allergenes: ['noten'],
					maxAmountOfParticipants: 12,
					price: 420.69,
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(403);
					message.should.be
						.a('string')
						.that.equals(
							`Meal with Id: ${validMealId} does not belong to user with Id: 3`
						);

					done();
				});
		});

		it('TC-303-4: When no meal is linked to the given Id, a valid error message should be returned', (done) => {
			const newMeal = {
				name: 'Broodje krokante kip',
				description:
					'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
				isActive: true,
				isVega: false,
				isVegan: true,
				isToTakeHome: true,
				dateTime: '2022-05-17T08:27:15.000Z',
				imageUrl:
					'https://img3.restameta.com/950/288/4938944649502884.jpg',
				allergenes: ['noten'],
				maxAmountOfParticipants: 12,
				price: 420.69,
			};

			chai.request(server)
				.put(`/api/meal/${invalidMealId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.send(newMeal)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(404);
					message.should.be
						.a('string')
						.that.equals(
							`Meal with Id: ${invalidMealId} not found`
						);

					done();
				});
		});

		it('TC-303-5: When all parameters are valid, a valid update response should be returned', (done) => {
			const newMeal = {
				name: 'Broodje krokante kip',
				description:
					'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
				isActive: true,
				isVega: false,
				isVegan: true,
				isToTakeHome: true,
				dateTime: '2022-05-17T08:27:15.000Z',
				imageUrl:
					'https://img3.restameta.com/950/288/4938944649502884.jpg',
				allergenes: ['noten'],
				maxAmountOfParticipants: 12,
				price: 12.99,
			};

			chai.request(server)
				.put(`/api/meal/${validMealId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.send(newMeal)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(201);
					expect(result).to.deep.equal({
						id: result.id,
						cookId: 1,
						name: 'Broodje krokante kip',
						description:
							'Een lekker broodje krokante kip van Same Same met zoet-zure saus',
						isActive: true,
						isVega: false,
						isVegan: true,
						isToTakeHome: true,
						dateTime: result.dateTime,
						imageUrl:
							'https://img3.restameta.com/950/288/4938944649502884.jpg',
						allergenes: ['noten'],
						maxAmountOfParticipants: 12,
						price: 12.99,
						createDate: result.createDate,
						updateDate: result.updateDate,
					});

					done();
				});
		});
	});

	describe('UC-303: Overview of meals /api/meal', () => {
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

		it('TC-303-1: When a list of meals is requested, a valid array of meals should be returned', (done) => {
			chai.request(server)
				.get(`/api/meal`)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal([
						{
							id: 1,
							isActive: false,
							isVega: false,
							isVegan: false,
							isToTakeHome: true,
							dateTime: result[0].dateTime,
							maxAmountOfParticipants: 5,
							price: 6.5,
							imageUrl: 'image url',
							cookId: 1,
							createDate: result[0].createDate,
							updateDate: result[0].updateDate,
							name: 'Meal A',
							description: 'description',
							allergenes: [''],
						},
						{
							id: 2,
							isActive: false,
							isVega: false,
							isVegan: false,
							isToTakeHome: true,
							dateTime: result[1].dateTime,
							maxAmountOfParticipants: 5,
							price: 6.5,
							imageUrl: 'image url',
							cookId: 1,
							createDate: result[1].createDate,
							updateDate: result[1].updateDate,
							name: 'Meal B',
							description: 'description',
							allergenes: [''],
						},
					]);

					done();
				});
		});
	});

	describe('UC-304: Details of meals /api/meal', () => {
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

		it('TC-304-1: When a meal is not linked to the mealId, a valid error message should be returned', (done) => {
			chai.request(server)
				.get(`/api/meal/${invalidMealId}`)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(404);
					message.should.be
						.a('string')
						.that.equals(
							`Meal with Id: ${invalidMealId} not found`
						);

					done();
				});
		});

		it('TC-304-2: When a valid id is given, a meal object should be returned', (done) => {
			chai.request(server)
				.get(`/api/meal/${validMealId}`)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal({
						id: 1,
						isActive: false,
						isVega: false,
						isVegan: false,
						isToTakeHome: true,
						dateTime: result.dateTime,
						maxAmountOfParticipants: 5,
						price: 6.5,
						imageUrl: 'image url',
						cookId: 1,
						createDate: result.createDate,
						updateDate: result.updateDate,
						name: 'Meal A',
						description: 'description',
						allergenes: [''],
					});

					done();
				});
		});
	});

	describe('UC-305: Delete meal /api/meal/:mealId', () => {
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

		it('TC-305-2: When a user is not signed in, a valid error message should be returned', (done) => {
			chai.request(server)
				.delete(`/api/meal/${invalidMealId}`)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(401);
					message.should.be
						.a('string')
						.that.equals(`Authorization header missing`);

					done();
				});
		});

		it('TC-305-3: When the user is not the owner of the meal, a valid error message should be returned', (done) => {
			chai.request(server)
				.delete(`/api/meal/${validMealId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 3 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(403);
					message.should.be
						.a('string')
						.that.equals('User is not the owner of this meal');

					done();
				});
		});

		it('TC-305-4: When no meal is linked to the given id, a valid error message should be returned', (done) => {
			chai.request(server)
				.delete(`/api/meal/${invalidMealId}`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 3 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(404);
					message.should.be
						.a('string')
						.that.equals(
							`Meal with Id: ${invalidMealId} not found`
						);

					done();
				});
		});

		it('TC-305-5: When all parameters are valid, a valid confirmation message should be returned', (done) => {
			chai.request(server)
				.delete(`/api/meal/${validMealId}`)
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
							`Meal with Id: ${validMealId} has been deleted`
						);

					done();
				});
		});
	});

	describe('UC-401 Participating a user in a meal /api/meal/:mealId/participate', () => {
		beforeEach((done) => {
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err; // Not connected!

				connection.query(
					CLEAR_DB + INSERT_USERS + INSERT_MEALS,
					function (error, result, field) {
						// When done with the connection, release it.
						connection.release();

						// Handle error after the release
						if (error) throw error;

						done();
					}
				);
			});
		});

		it('TC-401-1 User not logged in when trying to participate in a meal', (done) => {
			chai.request(server)
				.get('/api/meal/1/participate')
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

		it('TC-401-2 Meal that user is trying to participate in doesnt exist', (done) => {
			chai.request(server)
				.get(`/api/meal/${invalidMealId}/participate`)
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
							`Meal with Id: ${invalidMealId} not found`
						);

					done();
				});
		});

		it('TC-401-3 User has succesfully participated in a meal', (done) => {
			chai.request(server)
				.get(`/api/meal/${validMealId}/participate`)
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					console.log(res.body);
					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal([
						{
							currentlyParticipating: true,
							currentAmountOfParticipants: 1,
						},
					]);

					done();
				});
		});
	});

	describe('UC-402 Removing a user participation from a meal /api/meal/:mealId/participate', () => {
		beforeEach((done) => {
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err; // Not connected!

				connection.query(
					CLEAR_DB +
						INSERT_USERS +
						INSERT_MEALS +
						INSERT_PARTICIPATION,
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

		it('TC-402-1 User not logged in when trying to remove participation in a meal', (done) => {
			chai.request(server)
				.get('/api/meal/1/participate')
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

		it('TC-402-2 Meal that user is trying to remove participation from doesnt exist', (done) => {
			chai.request(server)
				.get(`/api/meal/${invalidMealId}/participate`)
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
							`Meal with Id: ${invalidMealId} not found`
						);

					done();
				});
		});

		it('TC-402-3 User has succesfully removed participation from a meal', (done) => {
			chai.request(server)
				.get('/api/meal/1/participate')
				.set({
					Authorization:
						'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(200);
					expect(result).to.deep.equal([
						{
							currentlyParticipating: false,
							currentAmountOfParticipants: 0,
						},
					]);

					done();
				});
		});
	});
});
