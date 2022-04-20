class Movie {
    constructor(id) {}
}

class User {
    constructor(name, email) {}
}

class Database {
    movieId = 1;
    userId = 1;

    movies = [];
    users = [];

    constructor() {}

    // --------------------------------- Begin Table Movie ----------------------------------- //
    addMovie(info) {
        const id = this.movieId;
        const movie = {
            id,
            ...info,
        };

        this.movies.push(movie);
        console.log(movie);

        this.movieId++;

        return movie;
    }

    getAllMovies() {
        return this.movies;
    }

    getMovieFromId(id) {
        console.log(`Searching movie with Id ${movieId}`);
        const movie = this.movies.filter((item) => item.id == id);

        console.log(`Search results: ${movie}`);

        return movie.length == 0 ? null : movie[0];
    }

    deleteAllMovies() {
        this.movies = [];

        console.log(`Table movies emptied`);
    }

    deleteMovieFromId(id) {
        const movie = this.getMovieFromId(id);
        console.log(`Deleting: ${movie}`);

        if (movie != null) {
            const index = this.movies.indexOf(movie);

            if (index < 0) return;

            this.movies.splice(index, 1);
        }

        return movie;
    }

    // --------------------------------- End Table Movie ----------------------------------- //

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

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const database = new Database();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.all('*', (req, res, next) => {
    const method = req.method;

    console.log(`Method ${method} is called`);

    next();
});

// Test request
app.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        result: 'Hello World',
    });
});

// --------------------------------- Begin API Movie ----------------------------------- //

// Adding new movie
app.post('/api/movie', (req, res) => {
    const info = req.body;
    const movie = database.addMovie(info);

    res.status(201).json({
        status: 201,
        result: movie,
    });
});

// Get all movies
app.get('/api/movie', (req, res) => {
    res.status(200).json({
        status: 200,
        result: database.getAllMovies(),
    });
});

// Get movie with id
app.get('/api/movie/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    const movie = database.getMovieFromId(movieId);

    if (movie == null) {
        res.status(401).json({
            status: 401,
            result: `Movie with ID ${movieId} not found`,
        });

        return;
    }

    res.status(200).json({
        status: 200,
        result: movie,
    });
});

// Deleting all movies
app.delete('/api/movie', (req, res) => {
    database.deleteAllMovies();

    res.status(200).json({
        status: 200,
        result: `All movies have been deleted`,
    });
});

// Deleting a movie with id
app.delete('/api/movie/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    const movie = database.deleteMovieFromId(movieId);

    if (movie == null) {
        res.status(401).json({
            status: 401,
            result: `Movie with ID ${movieId} not found`,
        });
        return;
    }

    res.status(200).json({
        status: 200,
        result: `Movie with ID ${movieId} has been deleted`,
    });
});

// --------------------------------- End API Movie ----------------------------------- //

// --------------------------------- Begin API User ----------------------------------- //

// Adding a new user
app.post('/api/user', (req, res) => {
    const info = req.body;
    const user = database.addUser(info);

    res.status(200).json({
        status: 200,
        result: user,
    });
});

// Get all users
app.get('/api/user', (req, res) => {
    res.status(200).json({
        status: 200,
        result: database.getAllUsers(),
    });
});

// Get user with id
app.get('/api/user/:userId', (req, res) => {
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
});

// Deleting all users
app.delete('/api/user', (req, res) => {
    database.deleteAllUsers();

    res.status(200).json({
        status: 200,
        result: `All users have been deleted`,
    });
});

// Deleting a user with id
app.delete('/api/user/:userId', (req, res) => {
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
});

// --------------------------------- End User ----------------------------------- //

// No valid request found
app.all('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});