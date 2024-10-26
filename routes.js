import express from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import PitchDeckGenerator from "./src/PitchDeckGenerator.js";
import QuestionGenerator from "./src/QuestionGenerator.js";
import { cleanupOldFiles } from "./src/utils/fileUtils.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analysis route
router.post("/analyze", async (req, res) => {
  try {
    const data = req.body;
    const uploadsDir = path.join(__dirname, "uploads");

    // Initialize PitchDeckGenerator
    const generator = new PitchDeckGenerator("llama3");

    // Get AI analysis
    console.log("Getting AI analysis...");
    const analysis = await generator.getAIAnalysis(data);

    // // Generate presentation
    // console.log("Generating presentation...");
    // const filename = await generator.generatePitchDeck(data);

    // Send response
    res.json({
      success: true,
      analysis: analysis,
    });

    // Clean up old files
    cleanupOldFiles(uploadsDir);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      error: "Error processing request",
      message: error.message,
    });
  }
});

// Presentation generation route
router.post("/generate-presentation", async (req, res) => {
  try {
    const data = req.body;
    const uploadsDir = path.join(__dirname, "uploads");

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid input data",
      });
    }

    const generator = new PitchDeckGenerator("llama3");
    console.log("Starting presentation generation...");
    const filename = await generator.generatePitchDeck(data);

    // Move file to uploads directory
    const oldPath = path.join(process.cwd(), filename);
    const newPath = path.join(uploadsDir, filename);
    await fs.rename(oldPath, newPath);

    res.json({
      success: true,
      filename: filename,
      downloadUrl: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Failed to generate presentation:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Questions route
router.post("/questions", async (req, res) => {
  try {
    const businessData = req.body;

    // Validate input
    // if (!businessData || Object.keys(businessData).length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Business data is required",
    //   });
    // }

    // Initialize question generator
    const questionGenerator = new QuestionGenerator("llama3");

    // Generate questions
    console.log("Generating questions...");
    const questions = await questionGenerator.generateQuestions(businessData);

    // Send response
    res.json({
      success: true,
      questions: questions,
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate questions",
      message: error.message,
    });
  }
});

export default router;
