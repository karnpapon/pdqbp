const fs = require("fs");
const path = require("path");
const { makeSessionId, getDateFormat, delay } = require("../utils");

const ENQUEUED_ENDPOINT =
  "https://srddev-image-caption.hf.space/api/queue/push/";
const GET_PREDICT_ENDPOINT =
  "https://srddev-image-caption.hf.space/api/queue/status/";
const IMG_BASE_PATH = "../images";
const filename = IMG_BASE_PATH + "/" + getDateFormat(-1) + "_output.png";
const image = path.join(__dirname, filename);
const logfile = path.join(__dirname, "../logs.txt");
const file = fs.readFileSync(image, { encoding: "base64" });
const sessionId = makeSessionId(11);

const payload_enqueue = {
  action: "predict",
  fn_index: 0,
  session_hash: "",
  data: ["data:image/png;base64," + file],
};

const payload_getcaption = {
  hash: "",
};

const customHeaders = {
  "Content-Type": "application/json",
};

async function enqueue() {
  payload_enqueue.session_hash = sessionId;
  try {
    const response = await fetch(ENQUEUED_ENDPOINT, {
      method: "POST",
      headers: customHeaders,
      body: JSON.stringify(payload_enqueue),
    });
    const body = await response.json();
    return body;
  } catch (error) {
    console.error(error);
  }
}

async function getImageCaption(enqueue_resp) {
  payload_getcaption.hash = enqueue_resp.hash;

  while (true) {
    const response = await fetch(GET_PREDICT_ENDPOINT, {
      method: "POST",
      headers: customHeaders,
      body: JSON.stringify(payload_getcaption),
    });
    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`);
    }
    const results = await response.json();
    const { status } = results;
    console.log(`[request::status] ${status}`);
    if (status === "COMPLETE") {
      return results;
    }
    await delay(500); // Wait for a bit before re-requesting
  }
}

async function image2text() {
  try {
    const enq_body = await enqueue();
    const getPredict = await getImageCaption(enq_body);
    const datestamp = getDateFormat();
    fs.appendFileSync(
      logfile,
      "[" + datestamp + "]" + ": " + JSON.stringify(getPredict.data) + "\n"
    );
    // saveImage();
    return getPredict;
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  image2text,
  sessionId,
};
