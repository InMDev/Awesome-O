const videoEl = document.querySelector("video");
const output = document.getElementById("overlay");
const models = "https://simhub.github.io/avatar-face-expression/models";
const emotionDiv = document.getElementById("emotion");

const faceapi = window.faceapi;

async function initVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  videoEl.srcObject = stream;
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(models),
  faceapi.nets.faceExpressionNet.loadFromUri(models)
]).then(initVideo);

async function onPlay() {
  // TODO get faceDetectorOptions
  const options = new faceapi.TinyFaceDetectorOptions();
  const result = await faceapi
    .detectSingleFace(videoEl, options)
    .withFaceExpressions();

  if (result) {
    const dimensions = faceapi.matchDimensions(output, videoEl, true);
    const faceLocation = {
      x: result.detection._box._x,
      y: result.detection._box._y,
      width: result.detection._box._width,
      height: result.detection._box._height
    };
    const emotions = {
      happy: "😀",
      angry: "😡",
      disgusted: "🤢",
      fearful: "😱",
      neutral: "😐",
      surprised: "😳",
      sad: "😞"
    };
    const currentEmotion = result.expressions.asSortedArray()[0].expression;
    emotionDiv.innerText = emotions[currentEmotion] || currentEmotion;
    emotionDiv.style.cssText = `
      top: ${faceLocation.y - faceLocation.height / 2}px;
      left: ${faceLocation.x + 30 /*- faceLocation.width / 4*/}px;
      width: ${faceLocation.width}px;
      font-size: ${faceLocation.width * 0.6}px;
    `;
  }

  requestAnimationFrame(() => onPlay());
}
