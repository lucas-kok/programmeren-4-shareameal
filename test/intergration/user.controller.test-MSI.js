const { chai, assert } = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb';
const dbconnection = require('../../database/dbconnection');

chai.should();
chai.use(chaiHttp);

describe('Manage users', () => {
	describe('UC-201 add user /api/user', () => {
		beforeEach((done) => {
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err;
				connection.query(
					'DELETE FROM meal;',
					function (error, result, field) {
						connection.query(
							'DELETE FROM meal_participants_user;',
							function (error, result, field) {
								connection.query(
									'DELETE FROM user;',
									function (error, result, field) {
										connection.query(
											`INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES ('Charlotte', 'Kok', 'c12.kok@hotmail.nl', 'JonkerFr02_', '0650024873', 'Jonker Fransstraat', 'Rotterdam');`
										);
										connection.release();
										done();
									}
								);
							}
						);
					}
				);
			});
		});

		it('TC-201-1 When a required input is missing, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					// First name is missing
					lastName: 'Kok',
					emailAdress: 'lucas.kok@hotmail.nl',
					password: 'MyPet54_',
					phoneNumber: '0640052439',
					street: 'Perenmeet',
					city: 'Burgh-Haamstede',
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(400);
					result.should.be
						.a('string')
						.that.equals('First name must be a string');

					done();
				});
		});

		it('TC-201-2 When an email is not valid, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'Lucas',
					lastName: 'Kok',
					emailAdress: 'lucas.dekra.com',
					password: 'MyPet54_',
					phoneNumber: '0640052439',
					street: 'Perenmeet',
					city: 'Burgh-Haamstede',
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(400);
					result.should.be
						.a('string')
						.that.equals('The emailAdress is not valid');

					done();
				});
		});

		it('TC-201-3 When an password is not valid, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'Lucas',
					lastName: 'Kok',
					emailAdress: 'lucas.kok@hotmail.nl',
					password: 'mypet54',
					phoneNumber: '0640052439',
					street: 'Perenmeet',
					city: 'Burgh-Haamstede',
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;

					status.should.equals(400);
					result.should.be
						.a('string')
						.that.equals(
							'Password must contain 8-15 characters which contains at least one lower- and uppercase letter, one special character and one digit'
						);

					done();
				});
		});

		it('TC-201-4 When an emailAdress already exists, a valid error should be returned', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'Charlotte',
					lastName: 'Kok',
					emailAdress: 'c12.kok@hotmail.nl',
					password: 'MyPet54_',
					phoneNumber: '0640052439',
					street: 'Perenmeet',
					city: 'Burgh-Haamstede',
				})
				.end((err, res) => {
					res.should.be.an('object');

					const { status, result } = res.body;
					console.log(res.body.statusCode);

					status.should.equals(409);
					result.should.be
						.a('string')
						.that.equals(
							'User could not be added, emailAdress is already taken'
						);

					done();
				});
		});

		it('TC-201-5 When all parameters are valid, a valid registration message should be returned', (done) => {
			const newUser = {
				firstName: 'Lucas',
				lastName: 'Kok',
				emailAdress: 'lucas.kok@homtail.nl',
				password: 'MyPet54_',
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

					console.log(result);
					console.log(newUser);

					status.should.equals(200);
					assert.deepEqual(result, newUser);

					done();
				});
		});
	});
});
