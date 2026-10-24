import { Router } from "express";
import { createNote, getAllNotes,deleteNote, updateNote } from "../controller/notes.controller.js";

const router = Router();

router.route("/createNote").post(createNote);
router.route("/getAllNotes").get(getAllNotes)
router.route("/deletenote/:id").delete(deleteNote)
router.route("/updatenote/:id").put(updateNote)

export default router;