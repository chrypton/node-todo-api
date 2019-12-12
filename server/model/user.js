const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: `{VALUE} is not a valid email`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// @override
UserSchema.methods.toJSON = function () {
    var user = this;

    // toObject() responsible for taking mongoose 'user' variable
    // and converting it into regular object
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    // tokens array is empty in beginning so we will push access and token on to it

    // MongoDB's versions have inconsistency
    // and Array.push() i.e. tokens.push() method doesnt work as expected.
    // therefore, concat() method is being used
    //user.tokens.push({access, token});
    user.tokens = user.tokens.concat([{access, token}]);

    // we updated the local user model but didnt save yet
    // return user so we can chain .then() promise on server.js
    return user.save().then(() => {

        // returning token variable which defined above so it will be available on server.js
        // token value will get passed as the success argument for next then() call
        return token;
    });
};

UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;

  try{
      decoded = jwt.verify(token, 'abc123');
  }catch(e){
    // return new Promise((resolve, reject) => {
    //     reject();
    // });

    // similar as above but lot cleaner
    return Promise.reject();
  }

  return User.findOne({
     '_id': decoded._id,
     'tokens.token': token,
     'tokens.access': 'auth'
  });
};

var User = mongoose.model('User', UserSchema);

module.exports = { User };






// {
//     email: 'tuityfruity@example.com',
//     password: 'hsggwyiojzb2ut81ika7oap0o1',
//     tokens: [{
//       access: 'auth',
//       token: 'iojzb2uhsggwyiojzb2ut81ika7oap0o1'
//     }]
// }