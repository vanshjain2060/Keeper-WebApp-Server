const env = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const salRound = 10;
require("dotenv").config();
const app = express();

const cors = require("cors");
app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  `mongodb+srv://admin-vansh:${process.env.PASSWORD}@cluster0.ki3p5of.mongodb.net/userNotesDB`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Note = mongoose.model("Note", noteSchema);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  notes: [noteSchema],
});

const User = mongoose.model("User", userSchema);

app.post("/register", async function (req, res) {
  const hashedPassword = await bcrypt.hash(req.body.password, salRound);
  const hashEmail = md5(req.body.email);
  await User.findOne({ email: hashEmail })
    .then(async (existingUser) => {
      if (!existingUser || !existingUser._id) {
        const newUser = new User({
          email: hashEmail,
          password: hashedPassword,
        });
        console.log(newUser);
        newUser.save();
        res.send(newUser._id);
      } else {
        const match = await bcrypt.compare(
          req.body.password,
          existingUser.password
        );
        if (match) {
          res.send(existingUser._id);
        } else {
          res.send("");
        }
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/login", async function (req, res) {
  const enteredPassword = req.body.password;
  await User.findOne({ email: md5(req.body.email) })
    .then(async (user) => {
      if (!user._id || !user) return res.status(499).send("No User Found.");
      else {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
          res.send(user._id);
        } else {
          res.send("");
        }
      }
    })
    .catch((err) => {
      res.status(500).send("No User Found.");
    });
});

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

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port", `${process.env.PORT}`);
});
