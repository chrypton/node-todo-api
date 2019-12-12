var {User} = require('./../model/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if(!user){
            return Promise.reject();
        }

        // res.send(user);
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {

        // incase of error in try-catch in User model Promise will be rejected
        // above .then() will not execute
        res.status(401).send();

    });
};

module.exports = {authenticate};