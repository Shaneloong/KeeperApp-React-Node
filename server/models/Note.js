const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor'] }
    }],
    versions: [{
        content: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
