constexpress=require("express");// Importing Express framework for building the server

constcors=require("cors");// Importing CORS middleware to allow cross-origin requests

constmulter=require("multer");// Importing Multer for handling file uploads

constffmpeg=require("fluent-ffmpeg");// Importing Fluent FFmpeg to handle video/audio conversion

constffmpegPath=require("ffmpeg-static");// Importing static path of FFmpeg binaries

constfs=require("fs");// Importing File System module for file operations

constpath=require("path");// Importing Path module for handling file paths

const { exec } =require("child_process");// Importing child_process for executing shell commands

constsharp=require("sharp");// Importing sharp for image processing

constPDFDocument=require("pdfkit");// Importing PDFKit for creating PDFs

ffmpeg.setFfmpegPath(ffmpegPath);// Setting the FFmpeg path for Fluent FFmpeg

constapp=express();// Creating an Express application

app.use(cors());// Enabling CORS for all routes

constupload=multer({ dest:"uploads/" });// Configuring Multer to store uploaded files in 'uploads/' directory

// Route to handle file conversion

app.post("/convert",upload.single("file"),(req,res)=> {

  constfile=req.file;

  constoutputFormat=req.body.format;// Get the output format from the request body

  if (!file) {

    returnres.status(400).json({ error:"No file uploaded." });

  }

  constinputFilePath=path.join(__dirname,file.path);

  constoutputFilePath=path.join(__dirname,"uploads",`${file.filename}.${outputFormat}`);

  // Handle different conversions based on the output format

  if (outputFormat==="pdf") {

    // Convert image to PDF using PDFKit

    constdoc=newPDFDocument();

    constwriteStream=fs.createWriteStream(outputFilePath);

    doc.pipe(writeStream);

    doc.image(inputFilePath,0,0, { fit: [595.28,841.89] });// A4 size

    doc.end();

    writeStream.on("finish",()=> {

    res.json({ url:`http://localhost:5000/uploads/${file.filename}.pdf` });

    });

    writeStream.on("error",(err)=> {

    console.error("Error converting image to PDF:",err);

    res.status(500).json({ error:"Error converting file." });

    });

  } elseif (outputFormat==="jpg") {

    // Convert to Image (JPG)

    ffmpeg(inputFilePath)

    .toFormat("image2")

    .on("end",()=> {

    res.json({ url:`http://localhost:5000/uploads/${file.filename}.jpg` });

    })

    .on("error",(err)=> {

    console.error("Error converting file to JPG:",err);

    res.status(500).json({ error:"Error converting file." });

    })

    .save(outputFilePath);

  } elseif (outputFormat==="txt") {

    // Convert to Text

    // ...conversion logic...

  } else {

    returnres.status(400).json({ error:"Unsupported output format." });

  }

});

// Starting the server

constPORT=process.env.PORT||5000;// Defining the port number

app.listen(PORT,()=> {

  console.log(`Server is running on port ${PORT}`);// Logging that the server is running

});

// Serve static files from the uploads directory

app.use("/uploads",express.static(path.join(__dirname,"uploads")));
