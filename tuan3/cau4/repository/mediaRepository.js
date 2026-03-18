// Data Access Layer - Media Repository
const Media = require("../models/Media");

class MediaRepository {
  // Find all media
  async findAll() {
    try {
      return await Media.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error finding media: ${error.message}`);
    }
  }

  // Find media by ID
  async findById(id) {
    try {
      return await Media.findById(id);
    } catch (error) {
      throw new Error(`Error finding media by ID: ${error.message}`);
    }
  }

  // Save new media
  async save(mediaData) {
    try {
      const media = new Media(mediaData);
      return await media.save();
    } catch (error) {
      throw new Error(`Error saving media: ${error.message}`);
    }
  }

  // Delete media
  async delete(id) {
    try {
      return await Media.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting media: ${error.message}`);
    }
  }

  // Find media by filename
  async findByFilename(filename) {
    try {
      return await Media.findOne({ filename });
    } catch (error) {
      throw new Error(`Error finding media by filename: ${error.message}`);
    }
  }
}

module.exports = new MediaRepository();
