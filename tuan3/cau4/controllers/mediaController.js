// API Layer - Media Controller
const mediaService = require("../services/mediaService");

class MediaController {
  // GET /api/media - Get all media
  async getAllMedia(req, res) {
    try {
      const media = await mediaService.getAllMedia();
      res.status(200).json({
        success: true,
        data: media,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/media/:id - Get media by ID
  async getMediaById(req, res) {
    try {
      const media = await mediaService.getMediaById(req.params.id);
      res.status(200).json({
        success: true,
        data: media,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/media/upload - Upload media
  async uploadMedia(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const uploadedBy = req.body.uploadedBy || "anonymous";
      const media = await mediaService.uploadMedia(req.file, uploadedBy);

      res.status(201).json({
        success: true,
        data: media,
        message: "Media uploaded successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /api/media/:id - Delete media
  async deleteMedia(req, res) {
    try {
      await mediaService.deleteMedia(req.params.id);
      res.status(200).json({
        success: true,
        message: "Media deleted successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new MediaController();
