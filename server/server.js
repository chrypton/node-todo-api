require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

let { mongoose } = require('./db/mongoose');
let { Todo } = require('./model/todo');
let { User } = require('./model/user');
let { authenticate } = require('./middleware/authenticate');

let app = express();
const port = process.env.PORT;

app.use(bodyParser.json());




app.post('/todos', authenticate, async (req, res) => {
    let todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    try{
        const savedTodo = await todo.save();
        res.send(savedTodo);
    }catch(e){
        res.status(400).send(e);
    }


    // with Promises
    // todo.save().then((doc) => {
    //   res.send(doc);
    // }, (e) => {
    //   res.status(400).send(e);
    // });
});




app.get('/todos', authenticate, async (req, res) => {

    try{
        const todos = await Todo.find({ _creator: req.user._id });
        res.send({todos});
    }catch(e){
        res.status(400).send(e);
    }


    // with Promises
    // Todo.find({
    //   _creator: req.user._id
    // }).then((todos) => {
    // res.send({todos})
    // }, (e) => {
    // res.status(400).send(e);
    // });
});




app.get('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;

    // validate id using isValid
    if(!ObjectID.isValid(id))
    {
        return res.status(404).send();
    }

    try{
        const todo = await Todo.findOne({
            _id: id,
            _creator: req.user._id
        });

        if(!todo)
        {
            return res.status(404).send({});
        }

        res.send({todo});
    }catch(e){
        res.status(400).send();
    }


    // with Promises
    // Todo.findOne({
    //     _id: id,
    //     _creator: req.user._id
    // }).then((todo) => {
    //   if(!todo)
    //   {
    //     return res.status(404).send({});
    //   }
    //
    //   res.send({todo});
    //
    // })
    //  .catch(e => res.status(400).send());

});




app.delete('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    try{
        const todo = await Todo.findOneAndDelete({
            _id: id,
            _creator: req.user._id
        });
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }catch(e){
        res.status(400).send();
    }


    // with Promises
    // Todo.findOneAndDelete({
    //     _id: id,
    //     _creator: req.user._id
    // }).then((todo) => {
    //     if (!todo) {
    //         return res.status(404).send();
    //     }
    //
    //     res.send({todo});
    // }).catch((e) => {
    //     res.status(400).send();
    // });
});




app.patch('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    try{
        const todo = await Todo.findOneAndUpdate(
            { _id: id, _creator: req.user._id },
            {$set: body},
            {new: true}
        );

        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }catch(e){
        res.status(400).send();
    }


    // with Promises
    // Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
    //     if (!todo) {
    //         return res.status(404).send();
    //     }
    //
    //     res.send({todo});
    // }).catch((e) => {
    //     res.status(400).send();
    // })
});




// POST /users
app.post('/users', async (req, res) => {
    try{
        const body  = _.pick(req.body, ['email', 'password']);
        const user = new User(body);
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    }catch(e){
        res.status(400).send(e);
    }

    // with Promises
    // var body = _.pick(req.body, ['email', 'password']);
    // var user = new User(body);
    // user.save().then(() => {
    //   return user.generateAuthToken();
    //
    // }).then((token) => {
    //     res.header('x-auth', token).send(user);
    //
    // }).catch((e) => {
    //   res.status(400).send(e);
    // })
});




app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});




// POST /users/login {email, password}
app.post('/users/login', async(req, res) => {
    try{
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    }catch(e){
        res.status(400).send();
    }

    // with Promises
    // var body = _.pick(req.body, ['email', 'password']);
    // User.findByCredentials(body.email, body.password).then((user) => {
    //     return user.generateAuthToken().then((token) => {
    //         res.header('x-auth', token).send(user);
    //     });
    //
    // }).catch((e) => {
    //     res.status(400).send();
    //
    // });
});




app.delete('/users/me/token', authenticate, async(req, res) => {
    try{
        await req.user.removeToken(req.token);
        res.status(200).send();
    }catch(e){
        res.status(400).send();
    }


    // with Promises
    // req.user.removeToken(req.token).then(() => {
    //     res.status(200).send();
    // }, () => {
    //     res.status(400).send();
    // });
});




app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});




module.exports = { app };