const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const PORT = process.env.BACKEND_PORT || 5001;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const mongoURI = process.env.MONGODB_URI || (
    process.env.DB_USERNAME && process.env.DB_PASSWORD
        ? `mongodb+srv://${process.env.DB_USERNAME}:${encodeURIComponent(process.env.DB_PASSWORD)}@cluster0.gwrin.mongodb.net/KeeperAppDB`
        : 'mongodb://127.0.0.1:27017/KeeperAppDB'
);

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

const usersSchema = mongoose.Schema({
    username: String,
    password: String,
    notes: Array
});

const User = mongoose.model('User', usersSchema);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/login", async function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    try {
        const foundItems = await User.find({username: username, password: password});
        if (foundItems.length !== 0 && foundItems.length === 1){
            res.json({success: true, userID: foundItems[0]._id});
        } else {
            res.json({success: false});
        }
    } catch (err) {
        res.json({success: false, error: err.message});
    }
});

app.get("/notes/:user", async function(req, res){
    const currentUser = req.params.user;
    try {
        const foundItems = await User.findById(currentUser);
        if (!foundItems || foundItems.length === 0){
            res.json();
        } else {
            res.status(200).json({notes: foundItems.notes});
        }
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post("/register", async function(req, res){
    const newUsername = req.body.username;
    const newPassword = req.body.password;
    const retypePassword = req.body.retypePassword;
    if(newUsername !== "" && newPassword !== "" && newPassword === retypePassword){
        try {
            const foundItems = await User.findOne({username: newUsername});
            console.log(foundItems);
            if(!foundItems){
                const newUser = new User({
                    username: newUsername,
                    password: newPassword,
                    notes: []
                });
                await newUser.save();
                res.json({success: true});
            } else {
                res.json({success: "exist"});
            }
        } catch (err) {
            res.status(500).json({success: false, error: err.message});
        }
    } else {
        res.json({success: false});
    }
});

app.post("/delete", async function(req, res){
    const userID = req.body.userID;
    const noteIndex = req.body.noteIndex;
    console.log(noteIndex);
    try {
        const foundItems = await User.findById(userID);
        console.log(foundItems.notes);
        if(foundItems.notes && foundItems.notes.length !== 0){
            foundItems.notes.splice(noteIndex, 1);
            await foundItems.save();
            res.json({success: true});
        } else {
            res.json({success: false});
        }
    } catch (err) {
        res.status(500).json({success: false, error: err.message});
    }
});

app.post("/create", async function(req, res){
    console.log(req.body);
    const currentUser = req.body.id;
    const noteTitle = req.body.title;
    const noteContent = req.body.content;
    const newContent = {
        title: noteTitle,
        content: noteContent
    };

    try {
        const foundItems = await User.findById(currentUser);
        foundItems.notes.push(newContent);
        await foundItems.save();
        res.status(200).json({ success: true});
    } catch (err) {
        res.status(500).json({success: false, error: err.message});
    }
});

app.listen(PORT, function(){
    console.log("Server started on port " + PORT);
});
