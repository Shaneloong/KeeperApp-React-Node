import React, { useState } from "react";
import axios from "axios";
import { Button, TextField, CircularProgress, Typography, Paper, Box } from "@mui/material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';

function AIAssistant({ userId }) {
    const [mode, setMode] = useState("chat"); // 'chat' or 'search'
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleExecute = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setResponse("");

        try {
            const apiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
            if (mode === "chat") {
                const res = await axios.post(`${apiBase}/ai/chat`, { userId, question: input });
                setResponse(res.data.answer);
            } else {
                const res = await axios.post(`${apiBase}/ai/search`, { userId, query: input });
                if (res.data.results && res.data.results.length > 0) {
                    setResponse(`Found ${res.data.results.length} relevant note(s). (Scores: ${res.data.results.map(r => r.score.toFixed(2)).join(', ')})`);
                } else {
                    setResponse("No relevant notes found.");
                }
            }
        } catch (error) {
            setResponse("Error communicating with AI service.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 2, m: 2, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
            <Box display="flex" alignItems="center" mb={2}>
                <SmartToyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">AI Assistant</Typography>
            </Box>

            <Box display="flex" gap={1} mb={2}>
                <Button
                    variant={mode === "chat" ? "contained" : "outlined"}
                    onClick={() => setMode("chat")}
                    size="small"
                >
                    Chat
                </Button>
                <Button
                    variant={mode === "search" ? "contained" : "outlined"}
                    onClick={() => setMode("search")}
                    size="small"
                >
                    Semantic Search
                </Button>
            </Box>

            <Box display="flex" gap={1}>
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder={mode === "chat" ? "Ask a question about your notes..." : "Search by meaning..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleExecute()}
                />
                <Button variant="contained" color="secondary" onClick={handleExecute} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : (mode === "chat" ? "Ask" : <SearchIcon />)}
                </Button>
            </Box>

            {response && (
                <Box mt={2} p={2} sx={{ backgroundColor: '#fff', borderRadius: 1, border: '1px solid #ddd' }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                        {response}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}

export default AIAssistant;
