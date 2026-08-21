const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Note = require('./models/Note');

dotenv.config();

const mongoURI = process.env.MONGODB_URI || (
    process.env.DB_USERNAME && process.env.DB_PASSWORD
        ? `mongodb+srv://${process.env.DB_USERNAME}:${encodeURIComponent(process.env.DB_PASSWORD)}@cluster0.gwrin.mongodb.net/KeeperAppDB`
        : 'mongodb://127.0.0.1:27017/KeeperAppDB'
);

async function migrate() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Use the old schema temporarily to fetch old data
        const oldUserSchema = new mongoose.Schema({
            username: String,
            password: String,
            notes: Array
        });

        // Use a different model name to avoid overwriting compiled models
        const OldUser = mongoose.models.OldUser || mongoose.model('OldUser', oldUserSchema, 'users');

        const users = await OldUser.find({});
        console.log(`Found ${users.length} users to migrate.`);

        for (const user of users) {
            // Hash password if not already hashed (assuming bcrypt hashes start with $2b$ or $2a$)
            let newPassword = user.password;
            if (!newPassword.startsWith('$2b$') && !newPassword.startsWith('$2a$')) {
                const salt = await bcrypt.genSalt(10);
                newPassword = await bcrypt.hash(newPassword, salt);
                console.log(`Hashed password for user ${user.username}`);
            }

            // Update user password and remove 'notes' array field
            await User.updateOne(
                { _id: user._id },
                { $set: { password: newPassword }, $unset: { notes: "" } }
            );

            // Migrate notes
            if (user.notes && user.notes.length > 0) {
                for (const note of user.notes) {
                    const newNote = new Note({
                        title: note.title,
                        content: note.content,
                        owner: user._id,
                        collaborators: [],
                        versions: [{
                            content: note.content,
                            updatedBy: user._id
                        }]
                    });
                    await newNote.save();
                }
                console.log(`Migrated ${user.notes.length} notes for user ${user.username}`);
            }
        }

        console.log('Migration complete.');
        mongoose.disconnect();
    } catch (error) {
        console.error('Migration error:', error);
        mongoose.disconnect();
    }
}

migrate();
