import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

function HistoryModal({ noteId, token, onClose, onRestore }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/note/${noteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setVersions(data.versions.reverse()); // Newest first
            }
            setLoading(false);
        })
        .catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }, [noteId, token]);

    const handleRestore = (content) => {
        if(window.confirm("Are you sure you want to restore this version? This will overwrite the current content.")) {
            // Restore by updating the note with the old content
            fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ noteId, content })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success){
                    onRestore(); // trigger refresh
                    onClose();
                } else {
                    alert(data.error);
                }
            });
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h3 style={{marginTop: 0}}>Version History</h3>
                    <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2em' }}>✖</button>
                </div>

                {loading ? <p>Loading history...</p> : error ? <p style={{color: 'red'}}>{error}</p> : (
                    <div>
                        {versions.map((v, index) => (
                            <div key={v._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666', fontSize: '0.9em' }}>
                                    <span>{new Date(v.updatedAt).toLocaleString()}</span>
                                    <span>by {v.updatedBy?.username || 'Unknown'}</span>
                                </div>
                                <div style={{ maxHeight: '100px', overflow: 'hidden', borderTop: '1px dashed #eee', paddingTop: '10px' }} dangerouslySetInnerHTML={{ __html: v.content }} />
                                <button onClick={() => handleRestore(v.content)} className="btn btn-sm btn-outline-primary mt-2">
                                    Restore This Version
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HistoryModal;
