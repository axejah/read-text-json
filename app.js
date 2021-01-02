require("dotenv").config();
const express = require("express");
const path = require("path");

const uploadRoute = require("./routes/uploadData");

const PORT = process.env.PORT || 5005;
const app = express();

//set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

// route that saves jpeg and makes request to azure vision api
app.post("/upload", uploadRoute);

app.listen(PORT, () => {
  console.log("application is running");
});
