import { User } from "./model/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { auth } from "./middleware/auth.middleware.js";

const salRound = 10;

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to check authentication
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const decoded = jwt.verify(token, "this is our secret key");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/checkLoggedIn", authenticate, (req, res) => {
  res.json({ isLoggedIn: true, userId: req.user.id });
});

app.post("/register", async function (req, res) {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).send("User already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, salRound);
    const newUser = await User.create({
      email: email,
      password: hashedPassword
    });
    const token = jwt.sign(
      { id: newUser._id, email: email },
      "this is our secret key",
      { expiresIn: '1h' }
    );
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true
    };
    res.status(201).cookie("token", token, options).json({ userId: newUser._id });
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).send('');
});

app.post("/login", async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send("User not found.");
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign(
        { id: user._id, email },
        "this is our secret key",
        { expiresIn: '1h' }
      );
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.status(200).cookie("token", token, options).json({ userId: user._id });
    } else {
      res.status(401).send("Invalid credentials.");
    }
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
});

app.post("/user/:userId/note", authenticate, async (req, res) => {
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

app.get("/user/:userId/note", authenticate, async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    res.send(user.notes);
  } catch (error) {
    res.status(500).send("Error retrieving user's notes");
  }
});

app.delete("/user/:userId/note/:noteId", authenticate, async (req, res) => {
  const { userId, noteId } = req.params;
  try {
    const user = await User.findById(userId);

    user.notes.splice(noteId, 1);
    await user.save();

    res.send(user.notes);
  } catch (error) {
    res.status(500).send("Error deleting user's note");
  }
});

app.patch("/user/:userId/note/:noteId", authenticate, async (req, res) => {
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
