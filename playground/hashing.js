const sha256 = require('crypto-js/sha256');
const bcrypt = require('bcryptjs');

const myPwd = 'abc123';

const generateHash = (pwd) => {
  return bcrypt.genSalt(10)
               .then(salt => bcrypt.hash(pwd, salt))
               .catch(err => console.log(err));
}

(async() => {
  const hashedPwd = await generateHash(myPwd);
  console.log(`My password is: "${myPwd}".`);
  console.log(`Hashed password is: "${hashedPwd}".`);
  bcrypt.compare(myPwd, hashedPwd)
        .then(result => console.log(`They are the same: ${result}.`))
        .catch(err => console.log(err));
})();

//---------------------------------------------------------------------
// Get user id
let data = {id: 4};

// Create token to be sent to user
let token = {data, hash: sha256(JSON.stringify(data) + 'secretsalt').toString()};

// Hash data again to compare with received data
let resultHash = sha256(JSON.stringify(token.data) + 'secretsalt').toString();

if(resultHash === token.hash) {
  console.log('Data was not changed.');
} else {
  console.log('Data was changed. Do not trust!');
}
