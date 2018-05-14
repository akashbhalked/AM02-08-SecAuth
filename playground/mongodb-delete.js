const {MongoClient, ObjectID} = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'am02-08';

MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
  if(err) return console.log('Unable to connect to MongoDB server.');
  console.log('Connected to MongoDB server.');
  const db = client.db(dbName);

  db.collection('playground')
    .deleteMany({name: 'Tiffany'})
    .then(result => console.log(result))
    .catch(err => console.log('Unable to delete users: ', err));

  client.close();
});
