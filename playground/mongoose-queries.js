const {mongoose} = require('../server/db/mongoose');
const Todo = require('../server/models/Todo');

var id = '5a4ddaef1463c40ce9177d4a';  // Valid _id.
// var id = '5a4ddaef1463c40ce9177d4a11';  // Invalid _id.

// Find objects: returns an array (check for empty array).
Todo.find({_id: id})   // No need to use ObjectID() in mongoose.
    .then(
      (todos) => {
        console.log('Todo.find(): ', todos);
      }
    );

// Find one object: returns one object (check for null).
Todo.findOne({completed: false})
    .then(
      (todo) => {
        console.log('Todo.findOne(): ', todo);
      }
    );

const {ObjectID} = require('mongodb');

if(!ObjectID.isValid(id)) {
  console.log('Id is not valid.');
}

// Returns one object (check for null).
Todo.findById(id)
    .then(
      (todo) => {
        if(!todo) {
          return console.log('Todo.findById(): Not found.');
        }
        console.log('Todo.findById(): ', todo);
      }
    )
    .catch((e) => console.log(e));  // Catch invalid id format.
