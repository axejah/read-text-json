require("dotenv").config();
const express = require("express");
const router = express.Router();

const path = require("path");

const multer = require("multer");

const fs = require("fs");
const e = require("express");

const async = require("async");
const sleep = require("util").promisify(setTimeout);
const ComputerVisionClient = require("@azure/cognitiveservices-computervision")
  .ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname.split(".").shift() +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const extensions = /jpeg|jpg/;
    const extname = extensions.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mime = extensions.test(file.mimetype);

    if (mime && extname) {
      return cb(null, true);
    } else {
      cb("jpg bestanden pl0x");
    }
  },
}).single("imgInput");

// Azure credentials
const key = process.env.API_KEY;
const endpoint = process.env.API_URL;

// Instantiate computer vision client
const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);

router.post("/upload", async (req, res) => {
  try {
    // save image
    upload(req, res, (err) => {
      if (err) {
        res.render("index", { msg: err });
      } else {
        console.log(req.file);
      }
    });
    // azure call through function
    let data = await cvRequest("testimg.jpg");

    await res.render("result", { data: data });
  } catch {
    (err) => console.log(err);
  }
});

async function cvRequest(filename) {
  const img = filename;
  // const sample = "https://kevines.tech/img/testimg.jpg";

  // Recognize text in printed image from a URL
  const sample = process.env.UPLOAD_URL + img;
  console.log("Read printed text from URL...", sample.split("/").pop());
  const printedResult = await readTextFromURL(computerVisionClient, sample);
  return printRecText(printedResult);
}

async function readTextFromURL(client, url) {
  const STATUS_SUCCEEDED = "succeeded";
  const STATUS_FAILED = "failed";
  // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
  let result = await client.read(url);
  // Operation ID is last path segment of operationLocation (a URL)
  let operation = result.operationLocation.split("/").slice(-1)[0];

  // Wait for read recognition to complete
  // result.status is initially undefined, since it's the result of read
  while (result.status !== STATUS_SUCCEEDED) {
    await sleep(1000);
    result = await client.getReadResult(operation);
  }
  return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
}

function printRecText(readResults) {
  console.log("Recognized text:");
  for (const page in readResults) {
    if (readResults.length > 1) {
      console.log(`==== Page: ${page}`);
    }
    const result = readResults[page];
    if (result.lines.length) {
      return JSON.stringify(result);
    } else {
      console.log("No recognized text.");
    }
  }
}

module.exports = router;
