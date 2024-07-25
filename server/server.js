const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { generateToken } = require('./auth');
const { authenticateToken } = require('./middleware');

require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/CRUD", {
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    age: Number,
    username: { type: String, unique: true },
    password: String,
});

// User Model
const UserModel = mongoose.model("users", UserSchema);

// Register User
app.post("/register", async (req, res) => {
    const { username, password, name, age } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ username, password: hashedPassword, name, age });
        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Login User
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username });
        if (!user) return res.status(400).json('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json('Invalid credentials');

        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Protected Route Example
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Create User (for existing CRUD operations)
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
