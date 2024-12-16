import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

libre.convertAsync = promisify(libre.convert);

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const inputFileName = `${Date.now()}-${file.originalname}`;
    cb(null, inputFileName);
  },
});

const upload = multer({ storage: storage });

// Main function for conversion
async function main(inputFileName) {
  const ext = '.pdf'; // Target extension
  const inputPath = path.join(process.cwd(), `uploads/${inputFileName}`); // Input file
  const outputFileName = inputFileName.replace(/\.[^/.]+$/, ext); // Output file name
  const outputPath = path.join(process.cwd(), `uploads/${outputFileName}`); // Output file path

  try {
    // Read the input file
    const docxBuf = await fs.readFile(inputPath);

    // Convert the buffer to PDF format
    const pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);

    // Write the output buffer to a file
    await fs.writeFile(outputPath, pdfBuf);

    console.log(`File converted successfully: ${outputPath}`);
    return outputPath; // Return the path of the converted file
  } catch (error) {
    console.error(`Error converting file: ${error.message}`);
    throw error;
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('Hello Docs');
});

app.post('/uploads', upload.single('Doc_to_Pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const inputFileName = req.file.filename; // Uploaded file name
  try {
    // Convert the file and get the output path
    const outputPath = await main(inputFileName);

    // Send the converted file for download
    res.download(outputPath, path.basename(outputPath), (err) => {
      if (err) {
        console.error('Error sending file for download:', err);
        res.status(500).send('Error occurred while sending the file.');
      }
    });
  } catch (error) {
    console.error('Error during conversion:', error);
    res.status(500).send('An error occurred while converting the file.');
  }
});

// Start server
app.listen(5000, () => {
  console.log('App is running on port 5000');
});
