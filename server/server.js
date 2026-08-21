const { app, Note } = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const PORT = process.env.BACKEND_PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.user = decoded;
        next();
    });
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.user.username);

    socket.on('join_note', async (noteId) => {
        socket.join(noteId);
        console.log(`${socket.user.username} joined note ${noteId}`);
    });

    socket.on('leave_note', (noteId) => {
        socket.leave(noteId);
        console.log(`${socket.user.username} left note ${noteId}`);
    });

    socket.on('edit_note', async ({ noteId, content }) => {
        // Broadcast change to everyone else in the room
        socket.to(noteId).emit('note_updated', { content });

        // Auto-save logic (debounce or throttle could be added here)
        try {
            const note = await Note.findById(noteId);
            if (note) {
                // Verify user has permission to edit
                const isOwner = note.owner.toString() === socket.user.id;
                const isEditor = note.collaborators.some(c => c.user.toString() === socket.user.id && c.role === 'editor');
                if (isOwner || isEditor) {
                    note.content = content;
                    // For auto-save, we might not want to create a new version every single keystroke.
                    // Instead, we just update the content. The explicit "Save" API will create versions.
                    await note.save();
                }
            }
        } catch (error) {
            console.error('Error auto-saving note:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.username);
    });
});

server.listen(PORT, function(){
    console.log("Server started on port " + PORT);
});
