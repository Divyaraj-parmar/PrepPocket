import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import notesRouter from "./routes/notes.routes.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/notes", notesRouter);

app.get("/", (req, res) => {
    res.status(200).json({ status: "healthy", message: "Revision Notes API is running" });
});

// Database connection & Server start
async function startServer() {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in environment variables");
        }
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected successfully");
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1);
    }
}

startServer();