const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const { Todo } = require('./../../model/todo');
const { User } = require('./../../model/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
   _id: userOneId,
   email: 'bear@example.com',
   password: 'userPass1',
   tokens: [{
       access: 'auth',
       token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
   }]
},{
    _id: userTwoId,
    email: 'tuityfruity@example.com',
    password: 'userPass2'
}];

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
},{
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
}];

const populateTodos = (done) => {
    Todo.deleteMany({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
  User.deleteMany({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])

  }).then(() => done());
};

module.exports = { todos, populateTodos, users, populateUsers };