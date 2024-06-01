const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

const cors = require('cors')
app.use(cors())
app.use(express.json())

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userNotesDB", { useNewUrlParser: true, useUnifiedTopology: true });

const noteSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Note = mongoose.model("Note" , noteSchema)

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  notes: [noteSchema]
});

const User = mongoose.model("User", userSchema);

app.post("/register",async function(req, res){
await User.findOne({email : req.body.email}) 
    .then((existingUser) => {
        if( !existingUser || !existingUser._id) {

            const newUser = new User({
                email : req.body.email,
                password : req.body.password
            });
            console.log(newUser);
            newUser.save();
            res.send(newUser._id)
        }
        else {
            if(existingUser.password === req.body.password) {
                res.send(existingUser._id);
            }else if(existingUser.password !== req.body.password) {
                res.send("");
            }
        }
    })
    .catch((err) =>{
        res.status(500).send(err)
})

    
});

app.post("/login" ,async function (req, res) {
    const enteredEmail = req.body.email;
    const enteredPassword = req.body.password;
await    User.findOne({email : enteredEmail}) 
        .then((user) => {
            if( !user._id || !user) return res.status(499).send("No User Found.");
            else {
                if(user.password === enteredPassword) {
                    res.send(user._id);
                }else if(user.password !== password) {
                    res.send("");
                }
            }
        })
        .catch((err) =>{
            res.status(500).send("No User Found.")
        })
})


app.post("/user/:userId/note", async (req, res) => {
  const userId = req.params.userId;
  const { title, content } = req.body;

  try {
    const user = await User.findById(userId);
    const note = { title, content };
    user.notes.push(note);
    await user.save();
    res.send(user.notes);
  } catch (error) {
    res.status(500).send("Error adding note to user");
  }
});


app.get("/user/:userId/note", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    res.send(user.notes);
  } catch (error) {
    res.status(500).send("Error retrieving user's notes");
  }
});


// app.delete("/user/:userId/note/:noteId", async (req, res) => {
//   const {userId, noteId} = req.params;

//     const user = await User.findById(userId); 
//     const note = user.notes.id(noteId);
//     if (note) {
//         console.log("note found");
//       note.remove();
//       await user.save();
//     }
//       userUpdated = await User.findById(userId);
//       res.send(userUpdated.notes);
// });

app.delete("/user/:userId/note/:noteId", async (req, res) => {
    const { userId, noteId } = req.params;
    try {
      const user = await User.findById(userId);
    //   const noteIndex = user.notes.indexOf(noteId);
  
    //   if (noteIndex === -1) {
    //     return res.status(404).send("Note not found");
    //   }
      user.notes.splice(noteId, 1);
      await user.save();
  
      res.send(user.notes);
    } catch (error) {
      res.status(500).send("Error deleting user's note");
    }
  });
  
  

app.patch("/user/:userId/note/:noteId", async (req, res) => {
  const { userId, noteId } = req.params;
  const { title, content } = req.body;

  try {
    const user = await User.findById(userId);
    const note = user.notes.id(noteId);
    note.title = title;
    note.content = content;
    await user.save();
    res.send(user.notes);
  } catch (error) {
    res.status(500).send("Error updating user's note");
  }
});

app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running on port 8000.");
});
