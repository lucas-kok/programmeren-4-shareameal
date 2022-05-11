const chai = require('chai');
const assert = chai;
const chaiHttp = require('chai-http');
const server = require('../../index');

process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb';
const dbconnection = require('../../database/dbconnection');
const { expect } = require('chai');

chai.should();
chai.use(chaiHttp);

describe('Manage users', () => {
    describe('UC-201: add user /api/user', () => {
        beforeEach((done) => {
            dbconnection.getConnection(function(err, connection) {
                if (err) throw err; // Not connected!

                connection.query(
                    'DELETE FROM meal;',
                    function(error, result, field) {
                        connection.query(
                            'DELETE FROM meal_participants_user;',
                            function(error, result, field) {
                                connection.query(
                                    'DELETE FROM user;',
                                    function(error, result, field) {
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

        it('TC-201-1: When a required input is missing, a valid error should be returned', (done) => {
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

                    status.should.equals(401);
                    result.should.be
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
                    emailAdress: 'lucas.dekra.com',
                    password: 'MyPet54_',
                    phoneNumber: '0640052439',
                    street: 'Perenmeet',
                    city: 'Burgh-Haamstede',
                })
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(401);
                    result.should.be
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
                    emailAdress: 'lucas.kok@hotmail.nl',
                    password: 'mypet54',
                    phoneNumber: '0640052439',
                    street: 'Perenmeet',
                    city: 'Burgh-Haamstede',
                })
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(401);
                    result.should.be
                        .a('string')
                        .that.equals(
                            'Password must contain 8-15 characters which contains at least one lower- and uppercase letter, one special character and one digit'
                        );

                    done();
                });
        });

        it('TC-201-4: When an emailAdress already exists, a valid error should be returned', (done) => {
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

                    status.should.equals(401);
                    result.should.be
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

                    status.should.equals(200);
                    expect(result).to.deep.equal(newUser);

                    done();
                });
        });
    });

    describe('UC-202: Overview of users /api/user', () => {
        beforeEach((done) => {
            dbconnection.getConnection(function(err, connection) {
                if (err) throw err; // Not connected!

                connection.query(
                    'DELETE FROM meal;',
                    function(error, result, field) {
                        connection.query(
                            'DELETE FROM meal_participants_user;',
                            function(error, result, field) {
                                connection.query('DELETE FROM user;');
                                connection.query(
                                    `ALTER TABLE user AUTO_INCREMENT=1;`
                                );

                                connection.release();

                                done();
                            }
                        );
                    }
                );
            });
        });

        it('TC-202-1: When there are no users in the database, an empty array should be returned', (done) => {
            chai.request(server)
                .get('/api/user')
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(200);
                    expect(result).to.deep.equal([]);

                    done();
                });
        });

        it('TC-202-2: When two users are in the database, an array with those two users should be returned', (done) => {
            const arrayWithTwoUsers = [{
                    city: 'Rotterdam',
                    emailAdress: 'lucas.kok@hotmail.nl',
                    firstName: 'Lucas',
                    id: 1,
                    isActive: 1,
                    lastName: 'Kok',
                    password: 'Qwerty_155',
                    phoneNumber: '0640052439',
                    roles: 'editor,guest',
                    street: 'Jonker Fransstraat',
                },
                {
                    city: 'Rotterdam',
                    emailAdress: 'c12.kok@hotmail.nl',
                    firstName: 'Charlotte',
                    id: 2,
                    isActive: 1,
                    lastName: 'Kok',
                    password: 'JonkerFr02_',
                    phoneNumber: '0650024873',
                    roles: 'editor,guest',
                    street: 'Jonker Fransstraat',
                },
            ];

            dbconnection.getConnection(function(err, connection) {
                if (err) throw err; // Not connected!

                connection.query(
                    `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES ('Lucas', 'Kok', 'lucas.kok@hotmail.nl', 'Qwerty_155', '0640052439', 'Jonker Fransstraat', 'Rotterdam'), ('Charlotte', 'Kok', 'c12.kok@hotmail.nl', 'JonkerFr02_', '0650024873', 'Jonker Fransstraat', 'Rotterdam');`
                );

                connection.release();

                chai.request(server)
                    .get('/api/user')
                    .end((err, res) => {
                        res.should.be.an('object');

                        const { status, result } = res.body;

                        status.should.equals(200);
                        expect(result).to.deep.equal(arrayWithTwoUsers);

                        done();
                    });
            });
        });
    });

    describe('UC-204: Detail of users /api/user/:userId', () => {
        const validUserId = 1;
        const invalidUserId = -1;

        beforeEach((done) => {
            dbconnection.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query(
                    'DELETE FROM meal;',
                    function(error, result, field) {
                        connection.query(
                            'DELETE FROM meal_participants_user;',
                            function(error, result, field) {
                                connection.query(
                                    'DELETE FROM user;',
                                    function(error, result, field) {
                                        connection.query(
                                            `ALTER TABLE user AUTO_INCREMENT=1;`
                                        );
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

        it('TC-204-1: When entering an invalid token, a valid error message should return', (done) => {
            chai.request(server)
                .get('/api/user/dkkawe')
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(401);
                    result.should.equals('Id must be a number');

                    done();
                });
        });

        it('TC-204-2: When a valid Id is not linked to a user, a valid error message should return', (done) => {
            chai.request(server)
                .get(`/api/user/${invalidUserId}`)
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(404);
                    result.should.equals(
                        `User with id ${invalidUserId} could not be found`
                    );

                    done();
                });
        });

        it('TC-204-3: When a valid Id is given, a user should be returned', (done) => {
            const user = {
                id: 1,
                firstName: 'Charlotte',
                lastName: 'Kok',
                isActive: 1,
                emailAdress: 'c12.kok@hotmail.nl',
                password: 'JonkerFr02_',
                phoneNumber: '0650024873',
                roles: 'editor,guest',
                street: 'Jonker Fransstraat',
                city: 'Rotterdam',
            };

            chai.request(server)
                .get(`/api/user/${validUserId}`)
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
        const validUserId = 1;
        const invalidUserId = -1;

        beforeEach((done) => {
            dbconnection.getConnection(function(err, connection) {
                if (err) throw err; // Not connected!

                connection.query(
                    'DELETE FROM meal;',
                    function(error, result, field) {
                        connection.query(
                            'DELETE FROM meal_participants_user;',
                            function(error, result, field) {
                                connection.query(
                                    'DELETE FROM user;',
                                    function(error, result, field) {
                                        connection.query(
                                            `ALTER TABLE user AUTO_INCREMENT=1;`
                                        );
                                        connection.query(
                                            `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES ('Lukas', 'Kok', 'lucas.kok@hotmail.nl', 'JonkerFr02_', '0640052439', 'Jonker Fransstraat', 'Rotterdam');`
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

        it('TC-205-1: When the required field emailAdress is missing, a valid error message should be returned', (done) => {
            const updatedUser = {
                firstName: 'Lukas',
                lastName: 'Kok',
                password: 'JonkerFr02_',
                phoneNumber: '0640052439',
                street: 'Jonker Fransstraat',
                city: 'Rotterdam',
            };

            chai.request(server)
                .post(`/api/user/${validUserId}`)
                .send(updatedUser)
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(401);
                    result.should.equals('Email must be a string');

                    done();
                });
        });

        it('TC-205-3: When the phone number is not valid, a valid error message should be returned', (done) => {
            const updatedUser = {
                firstName: 'Lukas',
                lastName: 'Kok',
                emailAdress: 'lucas.kok@hotmail.nl',
                password: 'JonkerFr02_',
                phoneNumber: 640052439,
                street: 'Jonker Fransstraat',
                city: 'Rotterdam',
            };

            chai.request(server)
                .post(`/api/user/${validUserId}`)
                .send(updatedUser)
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(401);
                    result.should.equals('Phone number must be a string');

                    done();
                });
        });

        it('TC-205-4: When the Id is not linked to a user, a valid error message should be returned', (done) => {
            const updatedUser = {
                firstName: 'Lucas',
                lastName: 'Kok',
                emailAdress: 'lucas.kok@hotmail.nl',
                password: 'JonkerFr02_',
                phoneNumber: '0640052439',
                street: 'Jonker Fransstraat',
                city: 'Rotterdam',
            };

            chai.request(server)
                .post(`/api/user/${invalidUserId}`)
                .send(updatedUser)
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(400);
                    result.should.equals(
                        `User with id ${invalidUserId} not found`
                    );

                    done();
                });
        });

        it('TC-205-6: When all values are valid, the user should be updated and should be returned', (done) => {
            const updatedUser = {
                firstName: 'Lucas',
                lastName: 'Kok',
                emailAdress: 'lucas.kok@hotmail.nl',
                password: 'JonkerFr02_',
                phoneNumber: '0640052439',
                street: 'Jonker Fransstraat',
                city: 'Rotterdam',
            };

            chai.request(server)
                .post(`/api/user/${validUserId}`)
                .send(updatedUser)
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;
                    console.log(result);

                    status.should.equals(200);
                    expect(result).to.deep.equal(updatedUser);

                    done();
                });
        });
    });

    describe('UC-206: Deleting a user /api/user/:userId', () => {
        const validUserId = 1;
        const invalidUserId = -1;

        beforeEach((done) => {
            dbconnection.getConnection(function(err, connection) {
                if (err) throw err; // Not connected!

                connection.query(
                    'DELETE FROM meal;',
                    function(error, result, field) {
                        connection.query(
                            'DELETE FROM meal_participants_user;',
                            function(error, result, field) {
                                connection.query(
                                    'DELETE FROM user;',
                                    function(error, result, field) {
                                        connection.query(
                                            `ALTER TABLE user AUTO_INCREMENT=1;`
                                        );
                                        connection.query(
                                            `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES ('Lukas', 'Kok', 'lucas.kok@hotmail.nl', 'JonkerFr02_', '0640052439', 'Jonker Fransstraat', 'Rotterdam');`
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

        it('TC-206-1: When the Id is not linked to a user, a valid error should be returned', (done) => {
            chai.request(server)
                .delete(`/api/user/${invalidUserId}`)
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(400);
                    result.should.equals(
                        `User with id ${invalidUserId} not found`
                    );

                    done();
                });
        });

        it('TC-206-4: When the Id is linked to a user, the user should be deleted and a verification message should be returned', (done) => {
            chai.request(server)
                .delete(`/api/user/${validUserId}`)
                .end((err, res) => {
                    res.should.be.an('object');

                    const { status, result } = res.body;

                    status.should.equals(200);
                    result.should.equals(
                        `User with id ${validUserId} has been deleted`
                    );

                    done();
                });
        });
    });
});