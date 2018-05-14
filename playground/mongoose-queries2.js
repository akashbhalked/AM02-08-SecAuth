const {mongoose} = require('../server/db/mongoose');
const {User} = require('../server/models/User');

var id = '5a4d4e0f6d5c2f06acd11d5d';  // Valid _id.

User.findById(id)
    .then(
      (user) => {
        if(!user) {
          return console.log('No such user.');
        }
        console.log(JSON.stringify(user, undefined, 2));
      }
    )
    .catch((e) => console.log(e));
