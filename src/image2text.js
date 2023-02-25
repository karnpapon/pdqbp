const fs = require("fs");
const path = require("path");
const { makeSessionId, delay } = require("../utils");
const { ENQUEUED_ENDPOINT, GET_PREDICT_ENDPOINT } = require("./const");

const sessionId = makeSessionId(11);

const payload_getcaption = {
  hash: "",
};

const customHeaders = {
  "Content-Type": "application/json",
};

async function enqueue(prevData) {
  const imgBasePath = "../images";
  const prevFileName = imgBasePath + "/" + prevData + "_output.jpeg";
  const prevImg = path.join(__dirname, prevFileName);
  const prevImageAsBase64 = fs.readFileSync(prevImg, { encoding: "base64" });

  const payload_enqueue = {
    action: "predict",
    fn_index: 0,
    session_hash: "",
    data: ["data:image/jpeg;base64," + prevImageAsBase64],
  };

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

  for (;;) {
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

async function image2text(prevInputDate) {
  try {
    const enq_body = await enqueue(prevInputDate);
    const getPredict = await getImageCaption(enq_body);
    return getPredict;
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  image2text,
  sessionId,
};
