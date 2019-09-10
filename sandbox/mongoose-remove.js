const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/model/todo');
const {User} = require('./../server/model/user');

// Todo.deleteMany({}).then((result) => {
//   console.log(result);
// });

// Todo.findOneAndDelete
// Todo.findByIdAndDelete

// Todo.findOneAndDelete({_id: '57c4610dbb35fcbf6fda1154'}).then((todo) => {
//
// });

Todo.findByIdAndDelete('57c4610dbb35fcbf6fda1154').then((todo) => {
  console.log(todo);
});
