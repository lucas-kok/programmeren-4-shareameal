require('dotenv').config();

const express = require('express'),
    app = express(),
    port = process.env.PORT,
    userRoutes = require('./src/routes/users.routes'),
    mealRoutes = require('./src/routes/meal.routes'),
    authRoutes = require('./src/routes/authentication.routes'),
    bodyParser = require('body-parser');

app.use(bodyParser.json());

app.all('*', (req, res, next) => {
    const method = req.method;

    console.log(`Method ${method} is called`);

    next();
});

// Makes sure that the router will only recieve /api requests
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', mealRoutes);

// No valid request found
app.all('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.log(err.status);
    res.status(err.status).json(err);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app;