const fs = require("fs");
const path = require("path");

const ENQUEUED_ENDPOINT =
  "https://srddev-image-caption.hf.space/api/queue/push/";
const GET_PREDICT_ENDPOINT =
  "https://srddev-image-caption.hf.space/api/queue/status/";

const image = path.join(__dirname, "./image.jpg");
const file = fs.readFileSync(image, { encoding: "base64" });

const enqueue_payload = {
  action: "predict",
  fn_index: 0,
  session_hash: "rjb4tut9dkj",
  data: ["data:image/png;base64," + file],
};

const get_caption_payload = {
  hash: "",
};

const customHeaders = {
  "Content-Type": "application/json",
};

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

async function enqueue() {
  enqueue_payload.session_hash = makeid(11);
  try {
    const response = await fetch(ENQUEUED_ENDPOINT, {
      method: "POST",
      headers: customHeaders,
      body: JSON.stringify(enqueue_payload),
    });
    const body = await response.json();
    // console.log(body);
    return body;
  } catch (error) {
    console.error(error);
  }
}

function delay(number) {
  return new Promise((resolve) => setTimeout(resolve, number));
}

async function getImageCaption(enqueue_resp) {
  get_caption_payload.hash = enqueue_resp.hash;

  while (true) {
    const response = await fetch(GET_PREDICT_ENDPOINT, {
      method: "POST",
      headers: customHeaders,
      body: JSON.stringify(get_caption_payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`);
    }
    const results = await response.json();
    const { status } = results;
    console.log(`status: ${status}`);
    if (status === "COMPLETE") {
      return results;
    }
    await delay(500); // Wait for a bit before re-requesting
  }
}

(async () => {
  try {
    const enq_body = await enqueue();
    const getPredict = await getImageCaption(enq_body);
    console.log("getImageCaption", getPredict);
  } catch (err) {
    console.error(err);
  }
})();
