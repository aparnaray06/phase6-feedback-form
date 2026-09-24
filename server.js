import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;
let isDbConnected = false;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Schema
const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
}, { timestamps: true });

// Model
const Feedback = mongoose.model("Feedback", feedbackSchema);

function ensureDatabaseAvailable(req, res, next) {
    if (!isDbConnected || mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            error: "Database is unavailable. Check the MongoDB connection settings.",
        });
    }

    return next();
}

function normalizeRating(rawRating) {
    const rating = Number(rawRating);

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        return null;
    }

    return rating;
}

// POST - Save feedback
app.post("/feedback", ensureDatabaseAvailable, async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const rating = normalizeRating(req.body.rating);
        const comment = req.body.comment?.trim();

        if (!name || !comment || rating === null) {
            return res.status(400).json({
                error: "Name, rating (1-5), and comment are required.",
            });
        }

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
app.get("/feedback", ensureDatabaseAvailable, async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });

        res.status(200).json(feedback);
    } catch (error) {
        console.error("GET /feedback ERROR:", error);

        res.status(500).json({
            error: "Could not fetch feedback",
        });
    }
});

// PUT
app.put("/feedback/:id", ensureDatabaseAvailable, async (req, res) => {
    try {
        const { id } = req.params;
        const name = req.body.name?.trim();
        const rating = normalizeRating(req.body.rating);
        const comment = req.body.comment?.trim();

        if (!name || !comment || rating === null) {
            return res.status(400).json({
                error: "Name, rating (1-5), and comment are required.",
            });
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            {
                name,
                rating,
                comment,
            },
            { returnDocument: "after" }
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
app.delete("/feedback/:id", ensureDatabaseAvailable, async (req, res) => {
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

async function startServer() {
    mongoose.connection.on("connected", () => {
        isDbConnected = true;
        console.log("MongoDB connected");
    });

    mongoose.connection.on("disconnected", () => {
        isDbConnected = false;
        console.warn("MongoDB disconnected");
    });

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        console.warn("Starting app without MongoDB connectivity. Fix MONGO_URI to enable persistence.");
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();