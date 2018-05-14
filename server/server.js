require('./config/config');
const express = require('express');
const app = express();
require('./db/mongoose');

const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const todosRouter = require('./routes/todos');

const port = process.env.PORT;

app.use(bodyParser.json());
app.use('/users', usersRouter);
app.use('/todos', todosRouter);

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};
