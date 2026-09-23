import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Schema
const feedbackSchema = new mongoose.Schema({
    name: String,
    rating: Number,
    comment: String,
});

// Model
const Feedback = mongoose.model("Feedback", feedbackSchema);

// POST - Save feedback
app.post("/feedback", async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const rating = Number(req.body.rating);
        const comment = req.body.comment?.trim();

        const newFeedback = new Feedback({
            name,
            rating,
            comment,
        });

        await newFeedback.save();

        res.status(201).json({
            message: "Feedback saved successfully",
        });

    } catch (error) {
        console.error("POST /feedback ERROR:", error);

        res.status(500).json({
            error: error.message,
        });
    }
});

// GET
app.get("/feedback", async (req, res) => {
    try {
        const feedback = await Feedback.find();

        res.status(200).json(feedback);

    } catch (error) {
        console.error("GET /feedback ERROR:", error);

        res.status(500).json({
            error: "Could not fetch feedback",
        });
    }
});

// PUT
app.put("/feedback/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const name = req.body.name?.trim();
        const rating = Number(req.body.rating);
        const comment = req.body.comment?.trim();

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            {
                name,
                rating,
                comment,
            },
            { new: true }
        );

        if (!updatedFeedback) {
            return res.status(404).json({
                error: "Feedback not found",
            });
        }

        res.status(200).json({
            message: "Successful",
            feedback: updatedFeedback,
        });

    } catch (error) {
        console.error("PUT /feedback ERROR:", error);

        res.status(500).json({
            error: error.message,
        });
    }
});

// DELETE
app.delete("/feedback/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFeedback = await Feedback.findByIdAndDelete(id);

        if (!deletedFeedback) {
            return res.status(404).json({
                error: "Feedback not found",
            });
        }

        res.status(200).json({
            message: "Feedback deleted successfully",
        });

    } catch (error) {
        console.error("DELETE /feedback ERROR:", error);

        res.status(500).json({
            error: error.message,
        });
    }
});

// Start server after MongoDB connection
const PORT = process.env.PORT || 8000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

startServer();