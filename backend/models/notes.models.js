import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        trim: true,
        default: ""
    },
    tags: {
        type: [String],
        default: []
    },
    type: {
        type: String,
        enum: ["N", "Q"],
        default: "N"
    }
}, {
    timestamps: true
});

const Note = mongoose.model("Note", notesSchema);

export default Note;