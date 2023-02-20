const fs = require("fs");
const path = require("path");

const ENQUEUED_ENDPOINT =
  "https://srddev-image-caption.hf.space/api/queue/push/";
const GET_PREDICT_ENDPOINT =
  "https://srddev-image-caption.hf.space/api/queue/status/";

const image = path.join(__dirname, "./image.jpg");
const logfile = path.join(__dirname, "./logs.txt");
const file = fs.readFileSync(image, { encoding: "base64" });

// const test_base64 = path.join(__dirname, "./testbase64.txt");
// const test_base64_file = fs.readFileSync(test_base64, { encoding: "utf8" });

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

function makeSessionId(length) {
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

// function base64toBlob(base64Data, contentType) {
//   contentType = contentType || "";
//   let sliceSize = 1024;
//   const byteCharacters = Buffer.from(base64Data, "base64");
//   const bytesLength = byteCharacters.length;
//   const slicesCount = Math.ceil(bytesLength / sliceSize);
//   let byteArrays = new Array(slicesCount);

//   for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
//     let begin = sliceIndex * sliceSize;
//     let end = Math.min(begin + sliceSize, bytesLength);

//     let bytes = new Array(end - begin);
//     for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
//       bytes[i] = byteCharacters[offset].charCodeAt(0);
//     }
//     byteArrays[sliceIndex] = new Uint8Array(bytes);
//   }
//   return new Blob(byteArrays, { type: contentType });
// }

async function enqueue() {
  payload_enqueue.session_hash = makeSessionId(11);
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

function delay(number) {
  return new Promise((resolve) => setTimeout(resolve, number));
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
    console.log(`status: ${status}`);
    if (status === "COMPLETE") {
      return results;
    }
    await delay(500); // Wait for a bit before re-requesting
  }
}

function getDateFormat() {
  const d = new Date();
  const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
  const month = d.getMonth() < 10 ? `0${d.getMonth()}` : d.getMonth();
  return `[${date}-${month}-${d.getFullYear()}]`;
}

(async () => {
  try {
    const enq_body = await enqueue();
    const getPredict = await getImageCaption(enq_body);
    // const mock = {
    //   data: ["people playing a game of frisbee "],
    //   duration: 4.164351463317871,
    //   average_duration: 13.139440035492909,
    // };

    const datestamp = getDateFormat();
    fs.appendFileSync(
      logfile,
      datestamp + ": " + JSON.stringify(getPredict.data) + "\n"
    );
    // saveImage();
  } catch (err) {
    console.error(err);
  }
})();
