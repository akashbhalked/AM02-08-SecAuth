const jwt = require('jsonwebtoken');

let data = {id: 10};

let token = jwt.sign(data, 'secretsalt');

let decoded = jwt.verify(token, 'secretsalt');
console.log(decoded);
