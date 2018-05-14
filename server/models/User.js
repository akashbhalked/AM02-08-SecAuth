const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _pick = require('lodash').pick;
const bcrypt = require('bcryptjs');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    }
  ],
});

// Override instance method
userSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();
  return _pick(userObject, ['_id', 'email']);
};

// Create instance method
userSchema.methods.generateAuthToken = function() {
  let user = this;
  const access = 'auth';
  const token = jwt
    .sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET)
    .toString();
  user.tokens.push({access, token});
  return user.save()
             .then(usr => {
               if(!usr) return Promise.reject('Save new user failed.');
               return Promise.resolve(token);
             })
             .catch(err => Promise.reject(err));
};

// Create instance method to remove token for logout
userSchema.methods.removeToken = function(token) {
  let user = this;
  // $pull is a mongodb array operator
  return user.update({$pull: {tokens: {token}}});
};

// Mongoose middleware to hash passwords
userSchema.pre('save', function(next) {
  let user = this;

  if(user.isModified('password')) {
    bcrypt.genSalt(10)
          .then(salt => bcrypt.hash(user.password, salt))
          .then(hashed => {
            user.password = hashed;
            next();
          })
          .catch(err => next(err));
  } else {
    next();
  }
});

// Create model method to find user by credentials
userSchema.statics.findByCred = function(cred) {
  let User = this;
  let user;
  return User.findOne({email: cred.email})
              .then(usr => {
                if(!usr) return Promise.reject(new Error('Email Not Found!'));
                user = usr;
                return bcrypt.compare(cred.password, usr.password);
              })
              .then(res => {
                if(!res) return Promise.reject(new Error('Wrong Password!'));
                return Promise.resolve(user);
              })
              .catch(err => Promise.reject(err));
};

const User = mongoose.model('User', userSchema);

module.exports = User;
