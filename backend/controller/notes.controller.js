import Note from "../models/notes.models.js";

export const createNote = async (req, res) => {
    try {
        const { title, link, type, tags, content } = req.body;
        
        if (!title || !link) {
            return res.status(400).json({
                message: "Title and Link are required!"
            });
        }

        const note = new Note({
            title: title.trim(),
            link: link.trim(),
            tags: Array.isArray(tags) ? tags : [],
            type: type === "Q" ? "Q" : "N",
            content: content ? content.trim() : ""
        });

        const data = await note.save();
        return res.status(201).json({
            data,
            message: "Created successfully"
        });
    } catch (error) {
        console.error("Error creating note:", error);
        return res.status(500).json({
            message: error.message || "Failed to create note"
        });
    }
};

export const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        return res.status(200).json({
            data: notes,
        });
    } catch (error) {
        console.error("Error fetching notes:", error);
        return res.status(500).json({
            message: error.message || "Failed to fetch notes"
        });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);
        
        if (!deletedNote) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        return res.status(200).json({
            data: deletedNote,
            message: "Deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting note:", error);
        return res.status(500).json({
            message: error.message || "Failed to delete note"
        });
    }
};

export const updateNote = async (req, res) => {
    try {
        const { title, link, type, tags, content } = req.body;
        const { id } = req.params;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (link !== undefined) updateData.link = link.trim();
        if (type !== undefined) updateData.type = type;
        if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
        if (content !== undefined) updateData.content = content.trim();

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        return res.status(200).json({
            data: updatedNote,
            message: "Updated successfully"
        });
    } catch (error) {
        console.error("Error updating note:", error);
        return res.status(500).json({
            message: error.message || "Failed to update note"
        });
    }
};