import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import Login from "./Login";
import Register from "./Register";

function App() {
  
  const [registerWanted, setRegisterWanted] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUser") || "");
  const [notes, setNotes] = useState([]);

  function registerClick(){
    setRegisterWanted((previousState) => !previousState);
  }

  function registerAccount(credentials){
    console.log(credentials);
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(response => response.json())
    .then(data => {
      setRegisterSuccess(data.success);
      console.log(data);
    })
  }


  function checkLogin(credentials){
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    })
    .then((res) => res.json())
    .then((user) => {
      if(user.success){
        // setLoggedIn(true);
        setCurrentUser(user.userID);
        // localStorage.setItem("loggedIn", true);
        localStorage.setItem("currentUser", user.userID);
        fetchNotes(user.userID);
      }
    })
  }

  function fetchNotes(userID){
    fetch("/notes/" + userID)
        .then((res) => {
          return res.json();
        })
        .then((result) => {
          setNotes(result.notes);
          return;
        })  
  }

  function logout(){
    // setLoggedIn(false);
    // localStorage.setItem("loggedIn", false);
    setCurrentUser("");
    localStorage.setItem("currentUser", "");
    setNotes([]);
  }




  
  useEffect(() =>{
    if(currentUser !== "" && currentUser !== "undefined"){
      fetch("/notes/" + currentUser)
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        setNotes(result.notes);
        return;
      })
    }  
  }, [])

  function addNote(newNote) {
    newNote.id = currentUser;

    fetch("/create", {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newNote)
    })
    .then(response => response.json())
    .then(data => {
      if(data.success){
        setTimeout(fetchNotes(currentUser), 3000);
      }

    })
  }

  function deleteNote(id) {

    fetch("/delete", {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({noteIndex: id, userID: currentUser})
    })
    .then(response => response.json())
    .then(data => {
      if(data.success){
        setTimeout(fetchNotes(currentUser), 3000);
      }
    })
    
  }

    if(currentUser !== "" && currentUser !== "undefined"){
      return (
        <div>
          <Header clicked={logout} isLoggedIn={currentUser}/>
          <CreateArea id={currentUser} onAdd={addNote} />
          {notes.map((noteItem, index) => {
            return (
              <Note
                key={index}
                id={index}
                title={noteItem.title}
                content={noteItem.content}
                onDelete={deleteNote}
              />
            );
          })}
          <Footer />
        </div>
      );
    }
    else if(registerWanted){
      return <Register clicked={registerClick} success={registerSuccess} onSubmitForm={registerAccount} isLoggedIn={currentUser} />;
    }
    else {
      return (
        <div>
          <Header isLoggedIn={currentUser}/>
          <Login onSubmitForm={checkLogin} clicked={registerClick} />
          <Footer />
        </div>
      );
    }

}

export default App;
