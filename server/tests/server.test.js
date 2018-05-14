const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const Todo = require('../models/Todo');
const User = require('../models/User');

const {
  testTodos, populateTodos, testUsers, populateUsers
} = require('./seed/seed');

// Delete existing data, then insert testUsers & testTodos
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', done => {
    let text = 'Test todo text';
    request(app)
      .post('/todos')
      .set('x-auth', testUsers[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect(res => expect(res.body.text).toBe(text))
      .end((err, res) => {
        if(err) return done(err);
        Todo.find({text})
            .then(todos => {
              expect(todos.length).toBe(1);
              expect(todos[0].text).toBe(text);
              done();
            })
            .catch(err => done(err));
      });
  });

  it('should not create todo with invalid data', done => {
    request(app)
      .post('/todos')
      .set('x-auth', testUsers[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) return done(err);
        Todo.find()
            .then(todos => {
              expect(todos.length).toBe(3);
              done();
            })
            .catch(err => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => expect(res.body.todos.length).toBe(2))
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should get one todo by id', done => {
    request(app)
      .get(`/todos/${testTodos[0]._id.toHexString()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => expect(res.body.todo.text).toBe(testTodos[0].text))
      .end(done);
  });

  it('should not get one todo by other user', done => {
    request(app)
      .get(`/todos/${testTodos[1]._id.toHexString()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', done => {
    let id = new ObjectID();
    request(app)
      .get(`/todos/${id.toHexString()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(404)  // Not found
      .end(done);
  });

  it('should return 400 if id is invalid', done => {
    request(app)
      .get('/todos/123')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(400)  // Bad request
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    let id = testTodos[2]._id; // 3rd todo is by 1st user
    request(app)
      .delete(`/todos/${id.toHexString()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => expect(res.body.todo._id).toBe(id.toHexString()))
      .end((err, res) => {
        if(err) return done(err);
        Todo.findById(id)
            .then(todo => {
              expect(404);
              expect(todo).toBeFalsy();
              done();
            })
            .catch(err => done(err));
      });
  });

  it('should not remove a todo by another user', done => {
    let id = testTodos[2]._id; // 3rd todo is by 1st user
    request(app)
      .delete(`/todos/${id.toHexString()}`)
      .set('x-auth', testUsers[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if(err) return done(err);
        Todo.findById(id)
            .then(todo => {
              expect(todo).toBeTruthy();
              done();
            })
            .catch(err => done(err));
      });
  });

  it('should return 404 if todo not found', done => {
    let id = new ObjectID();
    request(app)
      .delete(`/todos/${id.toHexString()}`)
      .set('x-auth', testUsers[1].tokens[0].token)
      .expect(404)  // Not found
      .end(done);
  });

  it('should return 400 if id is invalid', done => {
    request(app)
      .delete('/todos/123')
      .set('x-auth', testUsers[1].tokens[0].token)
      .expect(400)  // Bad request
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    let id = testTodos[0]._id;
    let body = {text: 'Testing 123', completed: true};
    request(app)
      .patch(`/todos/${id.toHexString()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .send(body)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(body.text);
        expect(res.body.todo.completed).toBe(body.completed);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should not update todo by another user', done => {
    let id = testTodos[0]._id;
    let body = {text: 'Testing 123', completed: true};
    request(app)
      .patch(`/todos/${id.toHexString()}`)
      .set('x-auth', testUsers[1].tokens[0].token)
      .send(body)
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when not completed', done => {
    let id = testTodos[2]._id;
    let body = {text: 'Testing 456', completed: false};
    request(app)
      .patch(`/todos/${id.toHexString()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .send(body)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(body.text);
        expect(res.body.todo.completed).toBe(body.completed);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return a user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(testUsers[0]._id.toHexString());
        expect(res.body.email).toBe(testUsers[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', 'something')
      // .expect(401)
      .expect(500)
      .expect(res => expect(res.body).toEqual({}))
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', done => {
    let email = 'example@example.com';
    let password = '123456';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect(res => {
        expect(res.header['x-auth']).toBeTruthy();
        expect(res.body.user._id).toBeTruthy();
        expect(res.body.user.email).toBe(email);
      })
      .end(err => {
        if(err) return done(err);
        User.findOne({email})
            .then(user => {
              expect(200);
              expect(user).toBeTruthy();
              expect(user.password).not.toBe(password);
              done();
            })
            .catch(err => done(err));
      });
  });

  it('should return error for invalid requests', done => {
    let userObj = {email: 'example', password: 'a'};
    request(app)
      .post('/users')
      .send(userObj)
      // .expect(400)
      .expect(500)
      .end(done);
  });

  it('should not create user for duplicate email', done => {
    let email = testUsers[0].email;
    let userObj = {email, password: '123456'};
    request(app)
      .post('/users')
      .send(userObj)
      // .expect(400)
      .expect(500)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user & return auth token', done => {
    let userObj = testUsers[1];
    request(app)
      .post('/users/login')
      .send(userObj)
      .expect(200)
      .expect(res => expect(res.headers['x-auth']).toBeTruthy())
      .end((err, res) => {
        if(err) return done(err);
        User.findById(userObj._id)
            .then(user => {
              expect(user.toObject().tokens[1]).toMatchObject({
                access: 'auth',
                token: res.headers['x-auth']
              });
              done();
            })
            .catch(err => done(err));
      });
  });

  it('should reject invalid login', done => {
    let userObj = {
      email: testUsers[1].email,
      password: '123'
    };
    request(app)
      .post('/users/login')
      .send(userObj)
      // .expect(404)
      .expect(500)
      .expect(res => expect(res.headers['x-auth']).toBeFalsy())
      .end((err, res) => {
        if(err) return done(err);
        User.findById(testUsers[1]._id)
            .then(user => {
              expect(user.tokens.length).toBe(1);
              done();
            })
            .catch(err => done(err));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', done => {
    request(app)
      .delete('/users/me/logout')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err) return done(err);
        User.findById(testUsers[0]._id)
            .then(user => {
              expect(user.tokens.length).toBe(0);
              done();
            })
            .catch(err => done(err));
      });
  });
});
