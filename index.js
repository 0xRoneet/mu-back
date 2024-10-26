import express from "express";
import cors from "cors";
import { fileURLToPath } from 'url';
import path from "path";
import fs from "fs/promises";
import routes from './routes.js';
import { setupUploadsDirectory } from "./src/utils/fileUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const initializeApp = () => {
  const app = express();
  return app;
};

// Configure middlewares
const setupMiddleware = (app) => {
  app.use(cors({ origin: "*" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

// Configure static files and uploads
const setupStaticFiles = async (app) => {
  const uploadsDir = path.join(__dirname, "uploads");
  await setupUploadsDirectory(uploadsDir);
  app.use("/uploads", express.static(uploadsDir));
};

// Configure error handling
const setupErrorHandling = (app) => {
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  });
};

// Start server
const startServer = (app, port) => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

// Main function to bootstrap the application
const bootstrap = async () => {
  try {
    const port = process.env.PORT || 8000;
    const app = initializeApp();
    
    setupMiddleware(app);
    await setupStaticFiles(app);
    
    // Setup routes
    app.use('/api', routes);
    
    setupErrorHandling(app);
    startServer(app, port);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
bootstrap();