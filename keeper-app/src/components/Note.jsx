import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import EditNoteModal from "./EditNoteModal";
import ShareModal from "./ShareModal";
import HistoryModal from "./HistoryModal";

function Note(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isHistory, setIsHistory] = useState(false);

  function handleDelete() {
    props.onDelete(props.id);
  }

  return (
    <>
        <div className="note">
        <h1>{props.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: props.content }} />

        {props.isOwner && (
            <button onClick={handleDelete} title="Delete">
            <DeleteIcon />
            </button>
        )}

        <button onClick={() => setIsEditing(true)} title="Edit Live">
            <EditIcon />
        </button>

        {props.isOwner && (
            <button onClick={() => setIsSharing(true)} title="Share">
                <ShareIcon />
            </button>
        )}

        <button onClick={() => setIsHistory(true)} title="Version History">
            <HistoryIcon />
        </button>

        </div>

        {isEditing && (
            <EditNoteModal
                noteId={props.id}
                initialTitle={props.title}
                initialContent={props.content}
                token={props.token}
                onClose={() => setIsEditing(false)}
                onSave={() => {
                    if(props.onUpdate) props.onUpdate();
                }}
            />
        )}

        {isSharing && (
            <ShareModal
                noteId={props.id}
                token={props.token}
                onClose={() => setIsSharing(false)}
            />
        )}

        {isHistory && (
            <HistoryModal
                noteId={props.id}
                token={props.token}
                onClose={() => setIsHistory(false)}
                onRestore={() => {
                    if(props.onUpdate) props.onUpdate();
                }}
            />
        )}
    </>
  );
}

export default Note;
