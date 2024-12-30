app.post("/convert-pdf-to-docx",upload.single("file"),(req,res)=> {

  constfile=req.file;

  if (!file) {

    returnres.status(400).json({ error:"No file uploaded." });

  }

  constinputFilePath=path.join(__dirname,file.path);

  constoutputFilePath=path.join(

    __dirname,

    "uploads",

    `${file.filename}.docx`

  );

  console.log(`Converting PDF to DOCX: ${inputFilePath} -> ${outputFilePath}`);

  exec(`pdf2docx ${inputFilePath}${outputFilePath}`,(err,stdout,stderr)=> {

    if (err) {

    console.error("Error converting PDF to DOCX:",err);

    console.error("stderr:",stderr);

    returnres.status(500).json({ error:"Error converting file." });

    }

    console.log("stdout:",stdout);

    res.json({ url:`http://localhost:5000/uploads/${file.filename}.docx` });

    deleteAllFilesAfterFiveMinutes();

  });

});

app.post("/convert-docx-to-pdf",upload.single("file"),(req,res)=> {

  constfile=req.file;

  if (!file) {

    returnres.status(400).json({ error:"No file uploaded." });

  }

  constinputFilePath=path.join(__dirname,file.path);

  constoutputFilePath=path.join(

    __dirname,

    "uploads",

    `${file.filename}.pdf`

  );

  console.log(`Converting DOCX to PDF: ${inputFilePath} -> ${outputFilePath}`);

  exec(`docx2pdf ${inputFilePath}${outputFilePath}`,(err,stdout,stderr)=> {

    if (err) {

    console.error("Error converting DOCX to PDF:",err);

    console.error("stderr:",stderr);

    returnres.status(500).json({ error:"Error converting file." });

    }

    console.log("stdout:",stdout);

    res.json({ url:`http://localhost:5000/uploads/${file.filename}.pdf` });

    deleteAllFilesAfterFiveMinutes();

  });

});

app.post("/convert-other",upload.single("file"),(req,res)=> {

  constfile=req.file;

  constoutputFormat=req.body.format;

  if (!file) {

    returnres.status(400).json({ error:"No file uploaded." });

  }

  constinputFilePath=path.join(__dirname,file.path);

  constoutputFilePath=path.join(

    __dirname,

    "uploads",

    `${file.filename}.${outputFormat}`

  );

  if (outputFormat==="png") {

    sharp(inputFilePath)

    .png()

    .toFile(outputFilePath,(err,info)=> {

    if (err) {

    console.error("Error converting to PNG:",err);

    returnres.status(500).json({ error:"Error converting file." });

    }

    res.json({ url:`http://localhost:5000/uploads/${file.filename}.png` });

    deleteAllFilesAfterFiveMinutes();

    });

  } elseif (outputFormat==="gif") {

    ffmpeg(inputFilePath)

    .toFormat("gif")

    .on("end",()=> {

    res.json({ url:`http://localhost:5000/uploads/${file.filename}.gif` });

    deleteAllFilesAfterFiveMinutes();

    })

    .on("error",(err)=> {

    console.error("Error converting file to GIF:",err);

    res.status(500).json({ error:"Error converting file." });

    })

    .save(outputFilePath);

  } else {

    returnres.status(400).json({ error:"Unsupported output format." });

  }

});
