const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const https = require('https');
const app = express();
const port = 4000;

// Specify the path to your cert and key from Certbot
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/beta.verenigma.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/beta.verenigma.com/fullchain.pem')
};

// Audio file filter
const audioFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(wav|mp3|ogg|webm)$/)) { 
      return cb(new Error(`Only audio files (wav, mp3, ogg, webm) are allowed! ${file.originalname}`), false); 
    }
    cb(null, true);
  };
  
  const upload = multer({ 
    dest: 'uploads/',
    fileFilter: audioFilter,
    // You can also add a size limit here, e.g., limits: { fileSize: 10 * 1024 * 1024 } // for a 10MB limit
  }); 
  

// CORS Middleware
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // Adjust if needed
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Post route for file upload
app.post('/upload', upload.single('recording'), (req, res) => {
  const id = req.body.id;
  
  // Basic alphanumeric check
  if (!/^[a-z0-9]+$/i.test(id)) {
    return res.status(400).send({ success: false, message: 'Invalid ID format.' });
  }
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const outputPath = `uploads/${id}-${timestamp}.wav`;

  // Rename file with ID and timestamp
  fs.rename(req.file.path, outputPath, (err) => {
    if (err) return res.status(500).send({ success: false });

    res.send({ success: true, message: 'File saved!', filename: outputPath });
  });
});

// Creating HTTPS server
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});