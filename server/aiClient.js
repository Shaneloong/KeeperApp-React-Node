const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/api';

const aiClient = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: 30000, // 30 seconds for AI generation
});

const ingestNote = async (userId, noteId, title, content) => {
    try {
        await aiClient.post('/ingest', {
            user_id: userId,
            note_id: noteId.toString(),
            title: title,
            content: content
        });
        console.log(`Successfully ingested note ${noteId} for AI semantic search.`);
    } catch (error) {
        console.error('Failed to ingest note to AI service:', error.message);
    }
};

const deleteNote = async (noteId) => {
    try {
        await aiClient.delete(`/notes/${noteId}`);
        console.log(`Successfully deleted note ${noteId} from AI vector DB.`);
    } catch (error) {
        console.error('Failed to delete note from AI service:', error.message);
    }
};

const searchNotes = async (userId, query) => {
    try {
        const response = await aiClient.post('/search', {
            user_id: userId,
            query: query
        });
        return response.data.results;
    } catch (error) {
        console.error('Failed to search notes via AI service:', error.message);
        throw error;
    }
};

const chatWithNotes = async (userId, question) => {
    try {
        const response = await aiClient.post('/chat', {
            user_id: userId,
            question: question
        });
        return response.data.answer;
    } catch (error) {
        console.error('Failed to chat via AI service:', error.message);
        throw error;
    }
};

module.exports = {
    ingestNote,
    deleteNote,
    searchNotes,
    chatWithNotes
};
