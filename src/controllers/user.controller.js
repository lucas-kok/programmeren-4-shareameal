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

const assert = require('assert');
const database = new Database();
let controller = {
    validateMovie: (req, res, next) => {
        let movie = req.body;
        let { name, email } = movie;

        try {
            assert(typeof name === 'string', 'Title must be a string');
            assert(typeof email === 'string', 'Year must be a number');
            next();
        } catch (error) {
            res.status(400).json({
                status: 400,
                result: error.toString(),
            });

            next(error);
        }
    },

    addUser: (req, res) => {
        const info = req.body;
        const user = database.addUser(info);

        res.status(200).json({
            status: 200,
            result: user,
        });
    },

    getAllUsers: (req, res) => {
        res.status(200).json({
            status: 200,
            result: database.getAllUsers(),
        });
    },

    getUserWithId: (req, res) => {
        const userId = req.params.userId;
        const user = database.getUserFromId(userId);

        if (user == null) {
            res.status(401).json({
                status: 401,
                result: `User with ID ${userId} not found`,
            });

            return;
        }

        res.status(200).json({
            status: 200,
            result: user,
        });
    },

    deleteAllUsers: (req, res) => {
        database.deleteAllUsers();

        res.status(200).json({
            status: 200,
            result: `All users have been deleted`,
        });
    },

    deleteUserWithId: (req, res) => {
        const userId = req.params.userId;
        const user = database.deleteUserFromId(userId);

        if (user == null) {
            res.status(401).json({
                status: 401,
                result: `User with ID ${userId} not found`,
            });
            return;
        }

        res.status(200).json({
            status: 200,
            result: `User with ID ${userId} has been deleted`,
        });
    },
};

module.exports = controller;