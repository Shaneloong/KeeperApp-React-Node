import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function CreateArea(props) {
  const [isExpanded, setExpanded] = useState(false);
  const [note, setNote] = useState({
    title: "",
    content: ""
  });

  function handleTitleChange(event) {
    const { value } = event.target;
    setNote(prevNote => ({ ...prevNote, title: value }));
  }

  function handleContentChange(content) {
    setNote(prevNote => ({ ...prevNote, content: content }));
  }

  function submitNote(event) {
    props.onAdd(note);
    setNote({
      title: "",
      content: ""
    });
    setExpanded(false);
    event.preventDefault();
  }

  function expand() {
    setExpanded(true);
  }

  return (
    <div>
      <form className="create-note">
        {isExpanded && (
          <input
            name="title"
            onChange={handleTitleChange}
            value={note.title}
            placeholder="Title"
          />
        )}

        <div onClick={expand} style={{ padding: '10px 15px' }}>
          {isExpanded ? (
            <ReactQuill
               theme="snow"
               value={note.content}
               onChange={handleContentChange}
               placeholder="Take a note..."
            />
          ) : (
            <textarea
               placeholder="Take a note..."
               rows="1"
               readOnly
            />
          )}
        </div>

        <Zoom in={isExpanded}>
          <Fab onClick={submitNote}>
            <AddIcon />
          </Fab>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
