const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Note = require('./models/Note');

dotenv.config();
const PORT = process.env.BACKEND_PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

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

// Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/login", async function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    try {
        const user = await User.findOne({ username: username });
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
                res.json({ success: true, userID: user._id, token: token, username: user.username });
            } else {
                res.json({ success: false, error: 'Invalid password' });
            }
        } else {
            res.json({ success: false, error: 'User not found' });
        }
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

app.post("/register", async function(req, res){
    const newUsername = req.body.username;
    const newPassword = req.body.password;
    const retypePassword = req.body.retypePassword;
    if (newUsername !== "" && newPassword !== "" && newPassword === retypePassword) {
        try {
            const foundUser = await User.findOne({ username: newUsername });
            if (!foundUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newPassword, salt);

                const newUser = new User({
                    username: newUsername,
                    password: hashedPassword
                });
                await newUser.save();
                res.json({ success: true });
            } else {
                res.json({ success: "exist" });
            }
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    } else {
        res.json({ success: false, error: "Invalid input" });
    }
});

// Get notes for user (Owned and Shared)
app.get("/notes", authenticateToken, async function(req, res){
    try {
        const ownedNotes = await Note.find({ owner: req.user.id })
            .populate('collaborators.user', 'username')
            .populate('owner', 'username');

        const sharedNotes = await Note.find({ 'collaborators.user': req.user.id })
            .populate('collaborators.user', 'username')
            .populate('owner', 'username');

        res.status(200).json({ owned: ownedNotes, shared: sharedNotes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Note
app.post("/create", authenticateToken, async function(req, res){
    const { title, content } = req.body;
    try {
        const newNote = new Note({
            title: title || '',
            content: content || '',
            owner: req.user.id,
            versions: [{ content: content || '', updatedBy: req.user.id }]
        });
        await newNote.save();
        res.status(200).json({ success: true, note: newNote });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update Note
app.post("/update", authenticateToken, async function(req, res){
    const { noteId, title, content } = req.body;
    try {
        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ success: false, error: "Note not found" });

        // Check permission (owner or editor)
        const isOwner = note.owner.toString() === req.user.id;
        const isEditor = note.collaborators.some(c => c.user.toString() === req.user.id && c.role === 'editor');

        if (!isOwner && !isEditor) {
            return res.status(403).json({ success: false, error: "Permission denied" });
        }

        note.title = title !== undefined ? title : note.title;
        if (content !== undefined && content !== note.content) {
            note.content = content;
            // Add new version on manual save
            note.versions.push({ content: content, updatedBy: req.user.id });
        }

        await note.save();
        res.status(200).json({ success: true, note });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete Note
app.post("/delete", authenticateToken, async function(req, res){
    const { noteId } = req.body;
    try {
        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ success: false, error: "Note not found" });

        // Only owner can delete
        if (note.owner.toString() !== req.user.id) {
             return res.status(403).json({ success: false, error: "Permission denied. Only owner can delete." });
        }

        await Note.findByIdAndDelete(noteId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Share Note
app.post("/share", authenticateToken, async function(req, res){
    const { noteId, usernameToShareWith, role } = req.body; // role: 'viewer' or 'editor'
    try {
        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ success: false, error: "Note not found" });

        if (note.owner.toString() !== req.user.id) {
             return res.status(403).json({ success: false, error: "Only owner can share notes." });
        }

        const userToShareWith = await User.findOne({ username: usernameToShareWith });
        if (!userToShareWith) return res.status(404).json({ success: false, error: "User not found" });

        // Check if already shared
        const existingCollab = note.collaborators.find(c => c.user.toString() === userToShareWith._id.toString());
        if (existingCollab) {
            existingCollab.role = role; // update role
        } else {
            note.collaborators.push({ user: userToShareWith._id, role: role });
        }

        await note.save();
        res.json({ success: true, note });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Note by ID
app.get("/note/:id", authenticateToken, async function(req, res){
    try {
        const note = await Note.findById(req.params.id)
            .populate('collaborators.user', 'username')
            .populate('owner', 'username')
            .populate('versions.updatedBy', 'username');

        if (!note) return res.status(404).json({ error: "Note not found" });

        const isOwner = note.owner._id.toString() === req.user.id;
        const isCollab = note.collaborators.some(c => c.user._id.toString() === req.user.id);

        if (!isOwner && !isCollab) {
             return res.status(403).json({ error: "Permission denied" });
        }

        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { app, Note, User, authenticateToken };
