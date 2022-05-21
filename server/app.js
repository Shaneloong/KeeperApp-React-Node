const bodyParser = require('body-parser');
const path = require ('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname, '../keeper-app/build')));

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.gwrin.mongodb.net/KeeperAppDB`);

const usersSchema = mongoose.Schema({
    username: String,
    password: String,
    notes: Array
});

const User = mongoose.model('User', usersSchema);



app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    User.find({username: username, password: password}, function(err, foundItems){
        if (foundItems.length !== 0 && foundItems.length === 1){
            // console.log(foundItems);
            res.json({success: true, userID: foundItems[0]._id});
        } else{
            res.json({success: false});
        }
    })
})

app.get("/notes/:user", function(req, res){
    const currentUser = req.params.user;
    User.findById(currentUser, function(err, foundItems){
        if (foundItems.length === 0){
            res.json();
        } else{
            res.status(200).json({notes: foundItems.notes});
        }
    });
});

app.post("/register", function(req, res){
    const newUsername = req.body.username;
    const newPassword = req.body.password;
    const retypePassword = req.body.retypePassword;
    if(newUsername !== "" && newPassword !== "" && newPassword === retypePassword){
        User.findOne({username: newUsername}, function(err, foundItems){
            console.log(foundItems);
            if(!foundItems){
                const newUser = new User({
                    username: newUsername,
                    password: newPassword,
                    notes: []
                });
                newUser.save();
                res.json({success: true});
            }
            else{
                res.json({success: "exist"});
            }
        })
    }else{
        res.json({success: false});
    }
})

app.post("/delete", function(req, res){
    const userID = req.body.userID;
    const noteIndex = req.body.noteIndex;
    console.log(noteIndex);
    User.findById(userID, function(err, foundItems){
        console.log(foundItems.notes);
        if(foundItems.notes !== 0){
            foundItems.notes.splice(noteIndex, 1);
            foundItems.save();
            res.json({success: true});
        }
    })
})

app.post("/create", function(req, res){
    console.log(req.body);
    const currentUser = req.body.id;
    const noteTitle = req.body.title;
    const noteContent = req.body.content;
    const newContent = {
        title: noteTitle,
        content: noteContent
    };

    User.findById(currentUser, function(err, foundItems){
        if(!err){
            foundItems.notes.push(newContent);
            foundItems.save(function(err){
                if(!err){
                    res.status(200).json({ success: true});
                }
            })
        }
    })
})

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../keeper-app/build', 'index.html'));
});


app.listen(PORT, function(){
    console.log("Server started on port 3000");
})

