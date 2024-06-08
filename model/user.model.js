import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/userNotesDB", { useNewUrlParser: true });

const noteSchema = new mongoose.Schema({
  title: String,
  content: String
});

const userSchema = new mongoose.Schema({
    
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    password : {
        type : String,
        required : [true , "Password is required"]
    },
    token : String ,
    notes: [noteSchema],
},
{timestamps:true});

export const User = mongoose.model("User", userSchema);
