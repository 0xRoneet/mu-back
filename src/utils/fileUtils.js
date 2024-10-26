import fs from "fs/promises";
import path from "path";

export async function setupUploadsDirectory(uploadsDir) {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error("Error creating uploads directory:", err);
    throw err;
  }
}

export async function cleanupOldFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000; // 1 hour in milliseconds

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);

      if (stats.ctimeMs < oneHourAgo) {
        await fs.unlink(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error cleaning up files:", error);
    throw error;
  }
}