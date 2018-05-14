const {MongoClient, ObjectID} = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'am02-08';

MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
  if(err) return console.log('Unable to connect to MongoDB server.');
  console.log('Connected to MongoDB server.');
  const db = client.db(dbName);

  db.collection('playground')
    .find({name: 'Tiffany'})
    .toArray()
    .then(users => console.log(JSON.stringify(users, undefined, 2)))
    .catch(err => console.log(err));

  db.collection('playground')
    .find()
    .count()
    .then(count => console.log(`Number of total users: ${count}.`))
    .catch(err => console.log('Unable to count users: ', err));

  client.close();
});
