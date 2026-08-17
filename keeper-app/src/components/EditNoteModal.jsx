import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

function EditNoteModal({ noteId, initialTitle, initialContent, token, onClose, onSave }) {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize Socket.io connection with token
        socketRef.current = io(API_URL, {
            auth: { token }
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            socket.emit('join_note', noteId);
        });

        socket.on('note_updated', (data) => {
            setContent(data.content);
        });

        return () => {
            socket.emit('leave_note', noteId);
            socket.disconnect();
        };
    }, [noteId, token]);

    const handleContentChange = (value) => {
        setContent(value);
        if (socketRef.current) {
            socketRef.current.emit('edit_note', { noteId, content: value });
        }
    };

    const handleSave = () => {
        // Explicit save calls the API to create a new version
        fetch(`${API_URL}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ noteId, title, content })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                onSave(); // Refresh notes list
                onClose();
            } else {
                alert(data.error);
            }
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                width: '80%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ fontSize: '1.5em', border: 'none', borderBottom: '1px solid #ccc', outline: 'none', width: '70%' }}
                    />
                    <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2em' }}>✖</button>
                </div>

                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={handleContentChange}
                    style={{ height: '300px', marginBottom: '50px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={handleSave} className="btn btn-primary">Save & Close</button>
                </div>
            </div>
        </div>
    );
}

export default EditNoteModal;
