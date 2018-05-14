const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Reuseable middleware to authenticate user
module.exports = (req, res, next) => {
  const token = req.header('x-auth');
  let decoded;
  if(!token) return res.status(401).send('No token provided.');

  decoded = jwt.verify(token, process.env.JWT_SECRET);
  User.findOne({_id: decoded._id, 'tokens.token': token, 'tokens.access': 'auth'})
      .then(user => {
        if(!user) return res.status(401).send('Invalid token.');
        req.user = user;
        req.token = token;
        next();
      })
      .catch(err => res.status(401).send('JWT error.' + err));
};
