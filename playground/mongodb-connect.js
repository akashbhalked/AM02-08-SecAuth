const {MongoClient, ObjectID} = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'am02-08';

MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
  if(err) return console.log('Unable to connect to MongoDB server.');
  console.log('Connected to MongoDB server.');
  const db = client.db(dbName);

  db.collection('playground')
    .insertOne({name: 'Tiffany', age: 35}, (err, r) => {
      if(err) return console.log('Unable to insert user.', err);
      console.log(r.ops[0]._id.getTimestamp());
    });

  client.close();
});
