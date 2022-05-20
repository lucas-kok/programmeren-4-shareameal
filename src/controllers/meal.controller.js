const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const logger = require('../config/config').logger;
const controller = {
    validateMeal: (req, res, next) => {
        const meal = req.body;
        const {
            isVega,
            isVegan,
            isToTakeHome,
            dateTime,
            maxAmountOfParticipants,
            price,
            imageUrl,
            name,
            description,
            allergenes,
        } = meal;

        try {
            assert(typeof isVega === 'number', 'IsVega must be a number');
            assert(typeof isVegan === 'number', 'IsVegan must be a number');
            assert(
                typeof isToTakeHome === 'number',
                'IsToTakeHome must be a number'
            );
            assert(typeof dateTime === 'string', 'DateTime must be a number');
            assert(
                typeof maxAmountOfParticipants === 'number',
                'MaxAmountOfParticipants must be a number'
            );
            assert(typeof price === 'number', 'Price must be a decimal');
            assert(typeof imageUrl === 'string', 'ImageUrl must be a string');
            assert(typeof name === 'string', 'Name must be a number');
            assert(
                typeof description === 'string',
                'Description must be a number'
            );
            assert(
                typeof allergenes === 'string',
                'Allergenes must be a strings'
            );

            // Validating after making sure the variables are of the right type
            // Values must be 0 or 1
            assert(isVega == 0 || isVega == 1, 'IsVega must be either 0 or 1');
            assert(
                isVegan == 0 || isVegan == 1,
                'IsVegan must be either 0 or 1'
            );
            assert(
                isToTakeHome == 0 || isToTakeHome == 1,
                'IsToTakeHome must be either 0 or 1'
            );
            assert(
                allergenes
                .replace('gluten', '')
                .replace('lactose', '')
                .replace('noten', '')
                .replace(',', '').length == 0,
                `Allergenes can only contain: 'Gluten', 'lactose' or 'noten'`
            );

            next();
        } catch (error) {
            const selectiveErrorInformation = {
                status: 400,
                result: error.message,
            };

            next(selectiveErrorInformation);
        }
    },

    // UC-301: Create a meal
    addMeal: (req, res) => {
        const meal = req.body;
        const {
            isVega,
            isVegan,
            isToTakeHome,
            dateTime,
            maxAmountOfParticipants,
            price,
            imageUrl,
            name,
            description,
            allergenes,
        } = meal;
        const cookId = req.userId;

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // Not connected!

            // Use the connection
            connection.query(
                `INSERT INTO meal (isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES (${isVega}, ${isVegan}, ${isToTakeHome}, '${dateTime}', ${maxAmountOfParticipants}, ${price}, '${imageUrl}', ${cookId}, '${name}', '${description}', '${allergenes}');`,

                function(error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Don't use the connection here, it has been returned to the pool.
                    // Handle error after the release.
                    if (error) {
                        return res.status(409).json({
                            status: 409,
                            result: `Meal could not be created`,
                            error: error,
                        });
                    }

                    logger.debug('Meal succesfully created');

                    res.status(200).json({
                        status: 200,
                        result: meal,
                    });
                }
            );
        });
    },

    // UC-302: Update a meal
    updateMeal: (req, res) => {
        const mealId = req.params.mealId;
        const updatedMeal = req.body;
        const {
            isVega,
            isVegan,
            isToTakeHome,
            dateTime,
            maxAmountOfParticipants,
            price,
            imageUrl,
            name,
            description,
            allergenes,
        } = updatedMeal;

        logger.debug(`UpdateMeal called with Id: ${mealId}`);

        dbconnection.getConnection(function(err, connection) {
            connection.query(
                `UPDATE meal SET isVega = ${isVega}, isVegan = ${isVegan}, isToTakeHome = ${isToTakeHome}, dateTime = '${dateTime}', maxAmountOfParticipants = ${maxAmountOfParticipants}, price = ${price}, imageUrl = '${imageUrl}', name = '${name}', description = '${description}', allergenes = '${allergenes}' WHERE id = ${mealId};`,

                function(error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Don't use the connection here, it has been returned to the pool.
                    // Handle error after the release.
                    if (error) {
                        return res.status(409).json({
                            status: 409,
                            result: `Meal could not be updated`,
                            error: error,
                        });
                    }

                    logger.debug('Meal succesfully updated');

                    res.status(200).json({
                        status: 200,
                        result: updatedMeal,
                    });
                }
            );
        });
    },

    // UC-303: Request list of all meals
    getAllMeals: (req, res) => {
        logger.debug(`GetAllMeals called`);

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // Not connected!

            // Use the connection
            connection.query(
                'SELECT * FROM meal',
                function(error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (error) throw error;

                    // Don't use the connection here, it has been returned to the pool.
                    logger.debug(`#results: ${results.length}`);

                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                }
            );
        });
    },

    // UC-304: Request details of meal
    getMeal: (req, res) => {
        const mealId = req.params.mealId;

        logger.debug(`GetMeal called with Id: ${mealId}`);

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // Not connected!

            // Use the connection
            connection.query(
                `SELECT * FROM meal where id = ${mealId};`,
                function(error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (error) throw error;

                    // Don't use the connection here, it has been returned to the pool.
                    if (results.length <= 0) {
                        console.debug(
                            `Meal with id: ${mealId} could not be found`
                        );

                        return res.status(404).json({
                            status: 404,
                            result: `Meal with id ${mealId} could not be found`,
                        });
                    }

                    const meal = results[0];

                    logger.debug(meal);

                    res.status(200).json({
                        status: 200,
                        result: meal,
                    });
                }
            );
        });
    },

    // UC-305: Delete meal
    deleteMeal: (req, res) => {
        const mealId = req.params.mealId;
        const userId = req.userId;

        logger.debug(`DeleteMeal called with Id: ${mealId}`);

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // Not connected!

            // Use the connection
            connection.query(
                `SELECT cookId FROM meal WHERE id = ${mealId};`,
                function(error, results, fields) {
                    if (err) throw error;

                    logger.debug(results);
                    if (results.affectedRows == 0 || results.length == 0) {
                        logger.debug(`Meal with Id: ${mealId} not found`);

                        return res.status(400).json({
                            status: 400,
                            result: `Meal with Id: ${mealId} not found`,
                        });
                    }

                    const cookId = results[0].cookId;

                    if (userId != cookId) {
                        logger.debug(`User is not the owner of this meal`);

                        return res.status(400).json({
                            status: 400,
                            result: `User is not the owner of this meal`,
                        });
                    }

                    connection.query(
                        `DELETE FROM meal WHERE id = ${mealId}`,
                        function(error, results, fields) {
                            // When done with the connection, release it.
                            connection.release();

                            // Don't use the connection here, it has been returned to the pool.
                            // Handle error after the release.
                            if (error) throw error;

                            logger.debug(
                                `Meal with Id: ${mealId} has been deleted`
                            );

                            res.status(200).json({
                                status: 200,
                                result: `Meal with Id ${mealId} has been deleted`,
                            });
                        }
                    );
                }
            );
        });
    },
};

module.exports = controller;