class Database {
    movieId = 1;
    userId = 1;

    movies = [];
    users = [];

    constructor() {}

    // --------------------------------- Begin Table User ----------------------------------- //
    addUser(info) {
        const id = this.userId;
        const user = {
            id,
            ...info,
        };

        this.users.push(user);
        console.log(user);

        this.userId++;

        return user;
    }

    getAllUsers() {
        return this.users;
    }

    getUserFromId(id) {
        console.log(`Searching user with Id ${id}`);
        const user = this.users.filter((item) => item.id == id);

        console.log(`Search results: ${user}`);

        return user.length == 0 ? null : user[0];
    }

    deleteAllUsers() {
        this.users = [];

        console.log(`Table users emptied`);
    }

    deleteUserFromId(id) {
        const user = this.getUserFromId(id);
        console.log(`Deleting: ${user}`);

        if (user != null) {
            const index = this.users.indexOf(user);

            if (index < 0) return;

            this.users.splice(index, 1);
        }

        return user;
    }

    // --------------------------------- End Table User ----------------------------------- //
}

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const testDatabase = new Database();

chai.should();
chai.use(chaiHttp);

describe('Manage users', () => {
    describe('UC-201 add user /api/user', () => {
        beforeEach((done) => {
            testDatabase.deleteAllUsers();
            done();
        });

        it('TC-201-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    // Name is missing
                    email: 'lucas.kok@hotmail.nl',
                    password: 'qwerty123',
                })
                .end((err, res) => {
                    res.should.be.an('object');

                    let { status, result } = res.body;

                    status.should.equals(400);
                    result.should.be
                        .a('string')
                        .that.equals('Username must be a string');

                    done();
                });
        });

        it('TC-201-2 When an email is not valid (not a string), a valid error should be returned', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    name: 'Lucas Kok',
                    email: 54,
                    password: 'qwerty123',
                })
                .end((err, res) => {
                    res.should.be.an('object');

                    let { status, result } = res.body;

                    status.should.equals(400);
                    result.should.be
                        .a('string')
                        .that.equals('Email must be a string');

                    done();
                });
        });

        it('TC-201-3 When an password is not valid (not a string), a valid error should be returned', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    name: 'Lucas Kok',
                    email: 'lucas.kok@hotmail.nl',
                    password: 510043,
                })
                .end((err, res) => {
                    res.should.be.an('object');

                    let { status, result } = res.body;

                    status.should.equals(400);
                    result.should.be
                        .a('string')
                        .that.equals('Password must be a string');

                    done();
                });
        });

        it.only('TC-201-4 When an username already exists, a valid error should be returned', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    name: 'Lucas Kok',
                    email: 'lcp.kok@gmail.com',
                    password: 'mycutepet',
                })
                .end((err, res) => {
                    res.should.be.an('object');

                    let { status, result } = res.body;

                    status.should.equals(400);
                    result.should.be
                        .a('string')
                        .that.equals('Username already exists');

                    done();
                });
        });

        it('TC-201-5 When all parameters are valid, a valid registration message should be returned', (done) => {
            const newUser = {
                name: 'Lucas Kok',
                email: 'lucas.kok@hotmail.nl',
                password: 'qwerty123',
            };

            chai.request(server)
                .post('/api/user')
                .send(newUser)
                .end((err, res) => {
                    res.should.be.an('object');

                    let { status, result } = res.body;

                    status.should.equals(200);
                    result.name.should.equals(newUser.name);

                    done();
                });
        });
    });
});