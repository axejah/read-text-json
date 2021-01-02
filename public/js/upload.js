const fileInputBigContainer = document.querySelector(
  ".invisible-file-uploader"
);
const fileInputButton = document.querySelector(".real-input-button");
const submitBtn = document.querySelector("#submit-btn");
const filterLayer = document.querySelector(".effect-filter");
const progressBar = document.querySelector(".progress-bar");
let progressBarProgress = 0;
const fileReader = new FileReader();
const img = new Image();
let imgName = "";

function runUploadEffect() {
  progressBar.style.width = progressBarProgress + "%";
  progressBarProgress += 10;
}

function processFile() {
  fileReader.onload = () => {
    img.src = fileReader.result;
    document.querySelector(".img-preview").src = img.src;
    imgName = fileInputBigContainer.files[0].name;
  };
  fileReader.readAsDataURL(fileInputBigContainer.files[0]);
}

fileInputBigContainer.onchange = () => {
  processFile();
};

fileInputButton.onchange = () => {
  fileInputBigContainer.files = fileInputButton.files;
  processFile();
};
