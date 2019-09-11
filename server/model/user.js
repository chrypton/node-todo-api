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

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    // MongoDB's versions have inconsistency and Array.push() method doesnt work as expected.
    user.tokens = user.tokens.concat([{access, token}]);

    // return user so we can chain .then() promise on server.js
    return user.save().then(() => {
                return token;
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