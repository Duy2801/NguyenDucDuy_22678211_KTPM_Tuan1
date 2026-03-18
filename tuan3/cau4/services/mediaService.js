// Business Logic Layer - Media Service
const mediaRepository = require("../repository/mediaRepository");
const path = require("path");
const fs = require("fs").promises;

class MediaService {
  // Get all media
  async getAllMedia() {
    try {
      return await mediaRepository.findAll();
    } catch (error) {
      throw new Error(`Service error - Get all media: ${error.message}`);
    }
  }

  // Get media by ID
  async getMediaById(id) {
    try {
      const media = await mediaRepository.findById(id);
      if (!media) {
        throw new Error("Media not found");
      }
      return media;
    } catch (error) {
      throw new Error(`Service error - Get media by ID: ${error.message}`);
    }
  }

  // Upload media
  async uploadMedia(file, uploadedBy = "anonymous") {
    try {
      if (!file) {
        throw new Error("No file uploaded");
      }

      // Validate file type
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed",
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("File size exceeds 5MB limit");
      }

      const mediaData = {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        uploadedBy,
      };

      return await mediaRepository.save(mediaData);
    } catch (error) {
      throw new Error(`Service error - Upload media: ${error.message}`);
    }
  }

  // Delete media
  async deleteMedia(id) {
    try {
      const media = await mediaRepository.findById(id);
      if (!media) {
        throw new Error("Media not found");
      }

      // Delete physical file
      const filePath = path.join(__dirname, "..", "uploads", media.filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(
          `Warning: Could not delete physical file: ${error.message}`,
        );
      }

      await mediaRepository.delete(id);
      return { message: "Media deleted successfully" };
    } catch (error) {
      throw new Error(`Service error - Delete media: ${error.message}`);
    }
  }

  // Get media by filename
  async getMediaByFilename(filename) {
    try {
      const media = await mediaRepository.findByFilename(filename);
      if (!media) {
        throw new Error("Media not found");
      }
      return media;
    } catch (error) {
      throw new Error(
        `Service error - Get media by filename: ${error.message}`,
      );
    }
  }
}

module.exports = new MediaService();
