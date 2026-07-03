const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
app.get("/", (req, res) => {
    res.send("✅ ReviewSense AI Backend is Running");
});
app.post("/analyze", async (req, res) => {

    try {

        const { reviews } = req.body;

        const prompt = `

You are an experienced Product Manager.

Analyze these customer reviews.

Return ONLY valid JSON.

Format:

{
  "themes":[
    {"name":"Customer Support","mentions":5},
    {"name":"Delivery","mentions":4}
  ],

  "painPoints":[
    "Support chatbot is frustrating",
    "Late deliveries",
    "Refund delays"
  ],

  "features":[
    "Human support option",
    "Real-time ETA updates",
    "Instant refund tracking"
  ],

  "summary":"Write a short product brief."
}

Reviews:

${reviews}

`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        let text = response.text.trim();

        text = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        res.json(JSON.parse(text));

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Gemini failed"
        });

    }

});

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});