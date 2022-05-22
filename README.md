
# Share A Meal API

[![Deploy to Heroku](https://github.com/chevyriet/programmeren-4-shareameal/actions/workflows/main.yml/badge.svg)](https://github.com/chevyriet/programmeren-4-shareameal/actions/workflows)
![GitHub repo size](https://img.shields.io/github/repo-size/lucas-kok/programmeren-4-shareameal?label=File%20size)
![Github Language](https://img.shields.io/github/languages/top/chevyriet/programmeren-4-shareameal?color=informational)
![Github Tests](https://img.shields.io/badge/Tests-100%25%20passed%2C%200%25%20failed-blue)

An API written by Lucas Kok for the Share A Meal project.
Written with node.js and deployed on Heroku (https://p4-share-a-meal.herokuapp.com/)




## About

This API can be integrated into applications for CRUD functionalities for users and meals. These users will be able to participate in the created meals.

Next to the CRUD functionality does this API offer a login solution with a jwt (jsonwebtoken). With these tokens, users will be able to login only once (until the set duration date of the token expires) and perform all the CRUD functionalities.
## Installation

To install this project locally, run the following commands:

```bash
  git clone https://github.com/lucas-kok/programmeren-4-shareameal
  npm install
```

To run the API locally:
1. Intall XAMPP
2. Start MySQL on XAMPP 
3. Run the following command: 
 ```
  npm start
 ```

Afterwards, the API will be available on the LocalHost with port 3000 
    
## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## API Reference

All end-points and specifics about the required parameters can be found in the following link: https://shareameal-api.herokuapp.com/docs/

#### Authentication

| Request Type | Endpoint     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `POST`      | `/api/auth/login` | Login of user |

#### User

| Request Type | Endpoint     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `POST`      | `/api/user` | Register of new user |
| `GET`      | `/api/user` | Get all users |
| `GET`      | `/api/user/:id` | Get user by Id |
| `POST`      | `/api/user/:id` | Update user by Id |
| `DELETE`      | `/api/user/:id` | Delete user by Id |

#### Meal

| Request Type | Endpoint     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `POST`      | `/api/meal` | Register of new meal |
| `POST`      | `/api/meal/:id` | Update meal by Id |
| `GET`      | `/api/meal` | Get all meals |
| `GET`      | `/api/meal/:id` | Get meal by Id |
| `DELETE`      | `/api/meal/:id` | Delete meal by Id |



## Authors

 This API has been created by [@lucas-kok](https://github.com/lucas-kok)

