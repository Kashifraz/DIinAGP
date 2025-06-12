import express from 'express';
import { body, validationResult } from 'express-validator';
import Media from '../models/Media.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { uploadSingle, getFileUrl, deleteFile } from '../middleware/upload.js';
import path from 'path';

const router = express.Router();

/**
 * @route   POST /api/media/upload
 * @desc    Upload media file
 * @access  Private (Author only)
 */
router.post(
  '/upload',
  protect,
  authorize('author', 'admin'),
  uploadSingle,
  async (req, res) => {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      // Create media record
      const media = await Media.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: getFileUrl(req.file.filename),
        uploadedBy: req.user._id
      });

      // Populate uploader info
      await media.populate('uploadedBy', 'name email');

      sendSuccess(
        res,
        { media },
        'File uploaded successfully',
        201
      );
    } catch (error) {
      console.error('Upload error:', error);
      
      // Delete uploaded file if media record creation failed
      if (req.file) {
        deleteFile(req.file.filename);
      }

      if (error.message.includes('Invalid file type')) {
        return sendError(res, error.message, 400);
      }

      if (error.message.includes('File too large')) {
        return sendError(res, 'File size exceeds the maximum limit of 10MB', 400);
      }

      sendError(res, 'Failed to upload file', 500);
    }
  }
);

/**
 * @route   GET /api/media
 * @desc    Get all media files (for current user)
 * @access  Private (Author only)
 */
router.get(
  '/',
  protect,
  authorize('author', 'admin'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, mimeType } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const queryOptions = {
        limit: parseInt(limit),
        skip: skip,
        sort: { createdAt: -1 }
      };

      let media;
      let total;

      if (mimeType) {
        media = await Media.findByMimeType(mimeType)
          .limit(parseInt(limit))
          .skip(skip)
          .sort({ createdAt: -1 })
          .populate('uploadedBy', 'name email');
        total = await Media.countDocuments({ 
          uploadedBy: req.user._id,
          mimeType: new RegExp(mimeType, 'i')
        });
      } else {
        media = await Media.findByUploader(req.user._id, queryOptions);
        total = await Media.countDocuments({ uploadedBy: req.user._id });
      }

      sendSuccess(
        res,
        {
          media,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        },
        'Media retrieved successfully',
        200
      );
    } catch (error) {
      console.error('Get media error:', error);
      sendError(res, 'Failed to retrieve media', 500);
    }
  }
);

/**
 * @route   GET /api/media/:id
 * @desc    Get single media file
 * @access  Private (Author only - can only see own media)
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!media) {
      return sendError(res, 'Media not found', 404);
    }

    // Check if user owns this media or is admin
    if (media.uploadedBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to access this media', 403);
    }

    sendSuccess(res, { media }, 'Media retrieved successfully', 200);
  } catch (error) {
    console.error('Get media error:', error);
    
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid media ID', 400);
    }
    
    sendError(res, 'Failed to retrieve media', 500);
  }
});

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete media file
 * @access  Private (Author only - can only delete own media)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return sendError(res, 'Media not found', 404);
    }

    // Check if user owns this media or is admin
    if (media.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to delete this media', 403);
    }

    // Delete physical file
    const fileDeleted = deleteFile(media.filename);
    if (!fileDeleted) {
      console.warn(`File ${media.filename} not found on disk, but proceeding with database deletion`);
    }

    // Delete media record
    await Media.findByIdAndDelete(req.params.id);

    sendSuccess(res, null, 'Media deleted successfully', 200);
  } catch (error) {
    console.error('Delete media error:', error);
    
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid media ID', 400);
    }
    
    sendError(res, 'Failed to delete media', 500);
  }
});

export default router;

