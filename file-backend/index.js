const express = require("express"); // Importing Express framework for building the server
const cors = require("cors"); // Importing CORS middleware to allow cross-origin requests
const multer = require("multer"); // Importing Multer for handling file uploads
const ffmpeg = require("fluent-ffmpeg"); // Importing Fluent FFmpeg to handle video/audio conversion
const ffmpegPath = require("ffmpeg-static"); // Importing static path of FFmpeg binaries
const fs = require("fs"); // Importing File System module for file operations
const path = require("path"); // Importing Path module for handling file paths
const { exec } = require("child_process"); // Importing child_process for executing shell commands
const sharp = require("sharp"); // Importing sharp for image processing
const PDFDocument = require("pdfkit"); // Importing PDFKit for creating PDFs

ffmpeg.setFfmpegPath(ffmpegPath); // Setting the FFmpeg path for Fluent FFmpeg

const app = express(); // Creating an Express application
app.use(cors()); // Enabling CORS for all routes
const upload = multer({ dest: "uploads/" }); // Configuring Multer to store uploaded files in 'uploads/' directory

// Function to delete all files in the uploads directory after 5 minutes
const deleteAllFilesAfterFiveMinutes = () => {
  setTimeout(() => {
    fs.readdir(path.join(__dirname, "uploads"), (err, files) => {
      if (err) {
        console.error("Error reading uploads directory:", err);
        return;
      }
      files.forEach((file) => {
        const filePath = path.join(__dirname, "uploads", file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePath}:`, err);
          } else {
            console.log(`File ${filePath} deleted successfully.`);
          }
        });
      });
    });
  }, 5 * 60000); // 5 minutes = 300000 milliseconds
};

// Route to handle file conversion
app.post("/convert", upload.single("file"), (req, res) => {
  const file = req.file;
  const outputFormat = req.body.format; // Get the output format from the request body

  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const inputFilePath = path.join(__dirname, file.path);
  const outputFilePath = path.join(
    __dirname,
    "uploads",
    `${file.filename}.${outputFormat}`
  );

  // Handle different conversions based on the output format
  if (outputFormat === "pdf") {
    // Convert image to PDF using PDFKit
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);
    doc.image(inputFilePath, 0, 0, { fit: [595.28, 841.89] }); // A4 size
    doc.end();

    writeStream.on("finish", () => {
      res.json({ url: `http://localhost:5000/uploads/${file.filename}.pdf` });
      deleteAllFilesAfterFiveMinutes();
    });

    writeStream.on("error", (err) => {
      console.error("Error converting image to PDF:", err);
      res.status(500).json({ error: "Error converting file." });
    });
  } else if (outputFormat === "jpg") {
    // Convert to Image (JPG)
    ffmpeg(inputFilePath)
      .toFormat("image2")
      .on("end", () => {
        res.json({ url: `http://localhost:5000/uploads/${file.filename}.jpg` });
        deleteAllFilesAfterFiveMinutes();
      })
      .on("error", (err) => {
        console.error("Error converting file to JPG:", err);
        res.status(500).json({ error: "Error converting file." });
      })
      .save(outputFilePath);
  } else if (outputFormat === "txt") {
    // Convert to Text
    // ...conversion logic...
    // deleteAllFilesAfterFiveMinutes(); // Add this line after conversion logic
  } else {
    return res.status(400).json({ error: "Unsupported output format." });
  }
});

// Starting the server
const PORT = process.env.PORT || 5000; // Defining the port number
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Logging that the server is running
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
