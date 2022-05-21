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

const invalidToken = 'THisTokenIsNotValid';

describe('Authentication', () => {
	describe('UC-101: Login /auth/login', () => {
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

		it('TC-101-1: When a required input is missing, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/auth/login')
				.send({
					emailAdress: 'lucas.kok@hotmail.nl',
					// Password is missing
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('Password must be a string');

					done();
				});
		});

		it('TC-101-2: When an email is not valid, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/auth/login')
				.send({
					emailAdress: 06111,
					password: 'JonkerFr02_',
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('EmailAdress must be a string');

					done();
				});
		});

		it('TC-101-3: When an password is not valid, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/auth/login')
				.send({
					emailAdress: 'lucas.kok@hotmail.nl',
					password: 112334455,
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;

					status.should.equals(400);
					message.should.be
						.a('string')
						.that.equals('Password must be a string');

					done();
				});
		});

		it(`TC-101-4: When no user is linked to the tokens' Id, , a valid error should be returned`, (done) => {
			chai.request(server)
				.post('/auth/login')
				.send({
					emailAdress: 'info@pekict.nl',
					password: 'ThisIsMyPassword!',
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, message } = res.body;
					console.log(res.body.statusCode);

					status.should.equals(401);
					message.should.be
						.a('string')
						.that.equals('User not found or password invalid');

					done();
				});
		});

		it('TC-101-5: When all parameters are valid, a valid token should be returned', (done) => {
			const newUser = {
				emailAdress: 'lucas.kok@hotmail.nl',
				password: 'JonkerFr02_',
			};

			chai.request(server)
				.post('/auth/login')
				.send(newUser)
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					// Extracting the Id from the token
					const token = result.token;
					let userId = -1;
					jwt.verify(token, jwtSecretKey, (err, payload) => {
						if (err) throw err;

						if (payload) {
							userId = payload.userId;
						}
					});

					status.should.equals(200);
					userId.should.equals(1);

					done();
				});
		});
	});
});
