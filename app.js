const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

const cors = require('cors')
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/notesDB" , {useNewUrlParser : true});

const noteSchema = {
    title : String,
    content : String
}

const Note = mongoose.model("Note" , noteSchema);

app.post("/note" ,async (req, res) => {
    const note = new Note({
        title : req.body.title,
        content : req.body.content
    })
    await note.save();

    return res.send("Note added to db successfully")
})

app.get("/note" , async (req, res) => {
    const notes = await Note.find();
    return res.send(notes);
})

app.delete("/note/:noteId" , async function (req, res) {
    const id = req.params.noteId;
    const note = await Note.deleteOne({_id : id}); 
    console.log(note);
    const notes = await Note.find();
    return res.send(notes);
})

app.patch("/note/:noteId" , async function(req, res) {
    const id = req.params.noteId;
    const note = await Note.updateOne({_id : id} , {$set : req.body})
})

app.listen(process.env.PORT || 8000, () => {
    console.log("Server is running on port 8000.");
}); 