import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import Login from "./Login";
import Register from "./Register";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function App() {
  const [registerWanted, setRegisterWanted] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUser") || "");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  const [ownedNotes, setOwnedNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);

  function registerClick() {
    setRegisterWanted((previousState) => !previousState);
  }

  function registerAccount(credentials) {
    fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(response => response.json())
    .then(data => {
      setRegisterSuccess(data.success);
    });
  }

  function checkLogin(credentials) {
    fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setCurrentUser(data.userID);
        setToken(data.token);
        setUsername(data.username);

        localStorage.setItem("currentUser", data.userID);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);

        fetchNotes(data.token);
      } else {
        alert(data.error);
      }
    });
  }

  function fetchNotes(authToken) {
    fetch(`${API_URL}/notes`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then((res) => res.json())
    .then((result) => {
      if (!result.error) {
        setOwnedNotes(result.owned || []);
        setSharedNotes(result.shared || []);
      } else {
         if(result.error.includes("jwt")) {
            logout();
         }
      }
    })
    .catch(err => console.error(err));
  }

  function logout() {
    setCurrentUser("");
    setToken("");
    setUsername("");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setOwnedNotes([]);
    setSharedNotes([]);
  }

  useEffect(() => {
    if (token) {
      fetchNotes(token);
    }
  }, [token]);

  function addNote(newNote) {
    fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newNote)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        fetchNotes(token);
      }
    });
  }

  function deleteNote(id) {
    fetch(`${API_URL}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ noteId: id })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        fetchNotes(token);
      } else {
         alert(data.error);
      }
    });
  }

  if (token) {
    return (
      <div>
        <Header clicked={logout} isLoggedIn={currentUser} />
        <CreateArea onAdd={addNote} />

        <div style={{ padding: '0 20px' }}>
          <h2>My Notes</h2>
          {ownedNotes.map((noteItem) => (
            <Note
              key={noteItem._id}
              id={noteItem._id}
              title={noteItem.title}
              content={noteItem.content}
              onDelete={deleteNote}
              onUpdate={() => fetchNotes(token)}
              isOwner={true}
              token={token}
            />
          ))}

          {sharedNotes.length > 0 && (
            <>
              <h2 style={{ marginTop: '40px' }}>Shared With Me</h2>
              {sharedNotes.map((noteItem) => (
                <Note
                  key={noteItem._id}
                  id={noteItem._id}
                  title={noteItem.title}
                  content={noteItem.content}
                  onDelete={deleteNote}
              onUpdate={() => fetchNotes(token)}
                  isOwner={false}
                  token={token}
                />
              ))}
            </>
          )}
        </div>

        <Footer />
      </div>
    );
  } else if (registerWanted) {
    return <Register clicked={registerClick} success={registerSuccess} onSubmitForm={registerAccount} isLoggedIn={currentUser} />;
  } else {
    return (
      <div>
        <Header isLoggedIn={currentUser} />
        <Login onSubmitForm={checkLogin} clicked={registerClick} />
        <Footer />
      </div>
    );
  }
}

export default App;
