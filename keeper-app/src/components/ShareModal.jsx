import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function ShareModal({ noteId, token, onClose }) {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('viewer');
    const [message, setMessage] = useState('');

    const handleShare = () => {
        fetch(`${API_URL}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ noteId, usernameToShareWith: username, role })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setMessage(`Successfully shared with ${username} as ${role}`);
                setUsername('');
            } else {
                setMessage(`Error: ${data.error}`);
            }
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
                <h3 style={{marginTop: 0}}>Share Note</h3>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
                    <input
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Role:</label>
                    <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                    </select>
                </div>

                {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={onClose} className="btn btn-secondary">Close</button>
                    <button onClick={handleShare} className="btn btn-primary">Share</button>
                </div>
            </div>
        </div>
    );
}

export default ShareModal;
