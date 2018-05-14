const {mongoose} = require('../server/db/mongoose');
const Todo = require('../server/models/Todo');
const {User} = require('../server/models/User');
const {ObjectID} = require('mongodb');

// Todo.remove({})
//     .then(
//       (res) => {
//         console.log(res);
//       }
//     );

Todo.findOneAndRemove({_id: '5a4ee6f2efc1f812bc5f07ed'})
    .then(
      (todo) => {
        console.log({todo});
      }
    );

// Todo.findByIdAndRemove('5a4ee6ebefc1f812bc5f07ec')
//     .then(
//       (todo) => {
//         console.log({todo});
//       }
//     );
