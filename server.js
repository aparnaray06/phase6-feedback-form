import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();

dotenv.config();


// Middleware
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

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
            comment
        });
        await newFeedback.save();

        res.status(201).json({
            message: "Feedback saved successfully",
        });
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});

// GET
app.get("/feedback", async (req, res) => {
    try {
        const feedback = await Feedback.find();

        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({
            error: "Could not fetch feedback",
        });
    }
});

//PUT ROUT=======
app.put("/feedback/:id", async (req, res)=>{
    try{
        const {id}=req.params;

        const name = req.body.name?.trim();
        const rating = Number(req.body.rating);
        const comment = req.body.comment?.trim();

        const updatFeedback = await Feedback.findByIdAndUpdate(
            id, 
            {
                name,
                rating,
                comment,
            },
            {new:true}
        )
        if (!updatFeedback){
            return res.status(404).json({
                error:"Feedback not found",
            });
        }
        res.status(200).json({
            message:"Successfull",
            feedback:updatFeedback,
        });
    }catch(error){
        console.log(error);
        
        res.status(500).json({
            error: "Something went wrong"
        })
    }
})

//DELETE ROUT
app.delete("/feedback/:id", async (req, res)=>{
    try{
        const {id}=req.params;

       const deleteFeedback =  await Feedback.findByIdAndDelete(id);

        // if(!deleteFeedback){
        //     return res.status(404).json({
        //         error:"Feedback not found",
        //     })
        // }
        res.status(200).json({
            message:"Feedback deleted successfully",
        })
        // if(!deleteFeedback){
        //     return res.status(404).json({
        //         error:"Feedback not found",
        //     })
        // }

    }catch(error){
        res.status(500).json({
            error: "something went wrong"
        })
    }
})

// Start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


