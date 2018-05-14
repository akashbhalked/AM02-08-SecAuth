const jwt = require('jsonwebtoken');
const {ObjectID} = require('mongodb');
const Todo = require('../../models/Todo');
const User = require('../../models/User');

// Create 2 usersids for testing
const user1id = new ObjectID();
const user2id = new ObjectID();

// Create 3 todos for testing
const testTodos = [
  {_id: new ObjectID(), text: 'Todo 1', _creator: user1id},
  {_id: new ObjectID(), text: 'Todo 2', _creator: user2id},
  {_id: new ObjectID(), text: 'Todo 3', _creator: user1id,
   completed: true, completedAt: 123456},
];

// Delete all existing data, and add 'testTodos'
const populateTodos = (done) => {
  Todo.remove({})
      .then(() => Todo.insertMany(testTodos))
      .then(() => done());
};

const testUsers = [
  { _id: user1id, email: 'abbie@example.com', password: '123456',
    tokens: [
      { access: 'auth',
        token: jwt.sign({_id: user1id, access: 'auth'}, process.env.JWT_SECRET)
                  .toString(),
      }
    ],
  },
  { _id: user2id, email: 'chi@example.com', password: '123456',
    tokens: [
      { access: 'auth',
        token: jwt.sign({_id: user2id, access: 'auth'}, process.env.JWT_SECRET)
                  .toString(),
      }
    ],
  },
];

// User.insertMany() would not encrypt password.
const populateUsers = (done) => {
  User.remove({})
      .then(() => {
        // Return a promise for each user.
        let user1 = new User(testUsers[0]).save();
        let user2 = new User(testUsers[1]).save();

        // Wait for both promises to be returned.
        return Promise.all([user1, user2]);
      })
      .then(() => done());
};

module.exports = {testTodos, populateTodos, testUsers, populateUsers};
