const express = require('express');
const multer = require('multer');
const B2 = require('backblaze-b2');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vod', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize Backblaze B2
const b2 = new B2({
  applicationKeyId: 'YOUR_KEY_ID', // จาก Backblaze
  applicationKey: 'YOUR_APPLICATION_KEY', // จาก Backblaze
});

async function authorizeB2() {
  await b2.authorize();
  console.log('Backblaze B2 authorized successfully!');
}

authorizeB2();

// Models
const VideoSchema = new mongoose.Schema({
  title: String,
  category: String,
  file: String, // URL ของไฟล์ใน Backblaze
  subtitles: [{ language: String, url: String }],
});
const Video = mongoose.model('Video', VideoSchema);

// Multer for temporary file storage
const upload = multer({ dest: 'temp-uploads/' });

// Upload Video to Backblaze
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, category } = req.body;
    const tempFilePath = req.file.path;
    const fileName = req.file.originalname;

    // Get upload URL from Backblaze
    const bucketId = 'YOUR_BUCKET_ID'; // จาก Backblaze
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl(bucketId);

    // Upload file to Backblaze
    const fileData = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName,
      data: require('fs').createReadStream(tempFilePath),
      onUploadProgress: (progress) => {
        console.log(`Upload progress: ${progress}`);
      },
    });

    // Save video metadata to MongoDB
    const video = new Video({
      title,
      category,
      file: fileData.data.fileId, // File ID from Backblaze
    });
    await video.save();

    // Remove temporary file
    require('fs').unlinkSync(tempFilePath);

    res.send('Video uploaded successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading video.');
  }
});

// Get Download URL for a video
app.get('/video/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).send('Video not found');

    // Get download URL from Backblaze
    const fileId = video.file;
    const { data: { downloadUrl } } = await b2.downloadFileById({
      fileId,
    });

    res.send({ url: downloadUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving video.');
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
