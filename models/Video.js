const mongoose = require('mongoose');

// Schema for Video
const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true, // File ID from Backblaze B2
  },
  subtitles: [
    {
      language: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);
