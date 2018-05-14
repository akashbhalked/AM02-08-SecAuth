const express = require('express');
const router = express.Router();
const _pick = require('lodash').pick;
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');

// Create a new user --------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const body = _pick(req.body, ['email', 'password']);
    const user = new User(body);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).status(200).send({user});
  } catch(err) {
    next(err);
  }
});

// Get current user ---------------------------------------------------
router.get('/me', authenticate, (req, res) => {
  res.status(200).send(req.user);
});

// Login a user -------------------------------------------------------
router.post('/login', async (req, res, next) => {
  try {
    const cred = _pick(req.body, ['email', 'password']);
    const user = await User.findByCred(cred);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).status(200).send({user});
  } catch(err) {
    next(err);
  }
});

// Logout current user ------------------------------------------------
router.delete('/me/logout', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send('Successfully logged out.');
  } catch(err) {
    next(err);
  }
});

module.exports = router;
