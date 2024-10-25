const fetch = require("node-fetch");
const sharp = require("sharp");
const fs = require("fs/promises");
const path = require("path");

class ImageGenerator {
  constructor() {
    this.endpoint = process.env.OLLAMA_API_ENDPOINT;
    this.tempDir = path.join(__dirname, "../../temp");
  }

  async generateImage(prompt) {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "stable-diffusion",
          prompt: `professional, minimalist, clean corporate style, ${prompt}`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const imageBuffer = Buffer.from(data.response, "base64");

      // Process image
      const processedImage = await sharp(imageBuffer)
        .resize(800, 600, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toBuffer();

      // Save to temp file
      const tempFilePath = path.join(this.tempDir, `temp_${Date.now()}.png`);
      await fs.writeFile(tempFilePath, processedImage);
      return tempFilePath;
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  }

  async cleanup() {
    try {
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        if (file.startsWith("temp_") && file.endsWith(".png")) {
          await fs.unlink(path.join(this.tempDir, file));
        }
      }
    } catch (error) {
      console.error("Error cleaning up temporary files:", error);
    }
  }
}

module.exports = ImageGenerator;
