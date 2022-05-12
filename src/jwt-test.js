const jwt = require('jsonwebtoken');
const privateKey = 'secret';

jwt.sign({ foo: 'bar' }, privateKey, function(err, token) {
    console.log(token);
});