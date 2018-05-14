const express = require('express');
const router = express.Router();
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const authenticate = require('../middleware/authenticate');
const Todo = require('../models/Todo');

// Create a new todo --------------------------------------------------
router.post('/', authenticate, async (req, res) => {
  try {
    let todo = new Todo({text: req.body.text, _creator: req.user._id});
    let doc = await todo.save();
    res.status(200).send(doc);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all todos for logged in user -----------------------------------
router.get('/', authenticate, async (req, res) => {
  try {
    let todos = await Todo.find({_creator: req.user._id});
    res.status(200).send({todos});
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get one todo by id -------------------------------------------------
router.get('/:id', authenticate, async (req, res) => {
  try {
    let id = req.params.id;
    if(!ObjectID.isValid(id)) return res.status(400).send('Id is invalid.');
    let todo = await Todo.findOne({_id: id, _creator: req.user._id});
    if(!todo) return res.status(404).send('No such todo.');
    res.status(200).send({todo});
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete one todo by id ----------------------------------------------
router.delete('/:id', authenticate, async (req, res) => {
  try {
    let id = req.params.id;
    if(!ObjectID.isValid(id)) return res.status(400).send('Id is invalid.');
    let todo = await Todo.findOneAndRemove({_id: id, _creator: req.user._id});
    if(!todo) return res.status(404).send('No such todo.');
    res.status(200).send({todo});
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update one todo by id ----------------------------------------------
router.patch('/:id', authenticate, async (req, res) => {
  try {
    let id = req.params.id;
    let creator = req.user._id;
    let body = _.pick(req.body, ['text', 'completed']);
    if(!ObjectID.isValid(id)) return res.status(400).send('Id is invalid.');
    if(_.isBoolean(body.completed) && body.completed) body.completedAt = new Date().getTime();
    else {
      body.completed = false;
      body.completedAt = null;
    }
    let todo = await Todo.findOneAndUpdate({_id:id, _creator:creator}, {$set: body}, {new: true});
    if(!todo) return res.status(404).send('No such todo.');
    res.status(200).send({todo});
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
