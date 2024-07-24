const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/CRUD", {
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    age: Number
});

// User Model
const UserModel = mongoose.model("users", UserSchema);

// Create User
app.post("/createUser", (req, res) => {
    const newUser = new UserModel(req.body);
    newUser.save()
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Read Users
app.get("/getUsers", (req, res) => {
    UserModel.find({})
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Update User
app.put("/updateUser/:id", (req, res) => {
    UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Delete User
app.delete("/deleteUser/:id", (req, res) => {
    UserModel.findByIdAndDelete(req.params.id)
        .then(() => res.json('User deleted'))
        .catch(err => res.status(400).json('Error: ' + err));
});

app.listen(3002, () => {
    console.log("Server is Running on port 3002");
});
