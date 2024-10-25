import express from 'express';
import cors from 'cors';
import PitchDeckGenerator from './src/PitchDeckGenerator.js';
import fs from 'fs/promises';
import path from 'path';
import QuestionGenerator from './src/QuestionGenerator.js';


const app = express();
const port = process.env.PORT || 3000;

// Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
try {
  await fs.mkdir(uploadsDir, { recursive: true });
} catch (err) {
  console.error('Error creating uploads directory:', err);
}

// Sample data route - for testing purposes
app.get('/api/sample-data', (req, res) => {
  const sampleData = [
    {
      month: "2024 - 01",
      revenue: 342500,
      units_sold: 2850,
      avg_price: 120.18,
      cost_of_goods: 239750,
      profit_margin: 29.8,
      region: "North",
    },
  ];
  res.json(sampleData);
});

// Main analysis and presentation generation route
app.post('/api/analyze', async (req, res) => {
  try {
    const data = req.body;
    
    // Validate input data
    // if (!Array.isArray(data) || data.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Invalid input data. Expected non-empty array of business metrics.'
    //   });
    // }

    // Initialize PitchDeckGenerator with llama3 model
    const generator = new PitchDeckGenerator("llama3");

    // Get AI analysis
    console.log('Getting AI analysis...');
    const analysis = await generator.getAIAnalysis(data);

    // Generate presentation
    console.log('Generating presentation...');
    const filename = await generator.generatePitchDeck(data);
    
    // Read the generated file
    const filePath = path.join(process.cwd(), filename);
    const fileBuffer = await fs.readFile(filePath);
    
    // Move file to uploads directory
    const newFilePath = path.join(uploadsDir, filename);
    await fs.rename(filePath, newFilePath);

    // Construct file URL
    const fileUrl = `/uploads/${filename}`;

    // Send response
    res.json({
      success: true,
      analysis: analysis,
      presentationUrl: fileUrl,
      filename: filename
    });

    // Clean up old files
    cleanupOldFiles(uploadsDir);

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing request',
      message: error.message
    });
  }
});

// Direct generation endpoint (similar to your original main function)
app.post('/api/generate-presentation', async (req, res) => {
  try {
    const data = req.body;
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data'
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
      downloadUrl: `/uploads/${filename}`
    });

  } catch (error) {
    console.error("Failed to generate presentation:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Helper function to cleanup old files
async function cleanupOldFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour in milliseconds

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      if (stats.ctimeMs < oneHourAgo) {
        await fs.unlink(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.post('/api/questions', async (req, res) => {
  try {
    const businessData = req.body;

    // Validate input
    if (!businessData || Object.keys(businessData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Business data is required'
      });
    }

    // Initialize question generator
    const questionGenerator = new QuestionGenerator("llama3");

    // Generate questions
    console.log('Generating questions...');
    const questions = await questionGenerator.generateQuestions(businessData);

    // Send response
    res.json({
      success: true,
      questions: questions
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate questions',
      message: error.message
    });
  }
});

app.post('/api/questions/test', async (req, res) => {
  try {
    const sampleData = {
      company_name: "Sample Corp",
      industry: "Technology",
      key_metrics: {
        revenue: "$10M",
        growth_rate: "15%",
        market_share: "8%"
      },
      main_products: ["Product A", "Product B"],
      target_markets: ["Enterprise", "SMB"],
      competitors: ["Comp X", "Comp Y"]
    };

    const questionGenerator = new QuestionGenerator("llama3");
    const questions = await questionGenerator.generateQuestions(sampleData);

    res.json({
      success: true,
      questions: questions
    });

  } catch (error) {
    console.error('Error in test questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});