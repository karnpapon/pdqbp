const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const { marked } = require("marked");
const rand = require("random-seed").create();
const {
  saveImage,
  getDateFormat,
  buildReadmeContent,
  buildLogsContent,
  resizeBase64,
} = require("../utils");
const { WS_ENDPOINT } = require("./const");

const outputImagePath = path.join(__dirname, "../output");
const readmeFile = path.join(__dirname, "../README.md");
const logImageToTextfile = path.join(__dirname, "../logs-img-to-text.md");
const logTextToImagefile = path.join(__dirname, "../logs-text-to-img.md");

const guidance_scale = rand(8);
const params = {
  "left-region": guidance_scale,
  "center-region": guidance_scale,
  "right-region": guidance_scale,
  "overlap-region": 320, // not sure why number other than 320 is not works ?
  "diffusion-steps": rand.intBetween(35, 50),
  "random-seed": rand(9999999),
};

function updateFiles(caption) {
  fs.appendFileSync(logImageToTextfile, buildLogsContent(caption.data));
  fs.appendFileSync(logTextToImagefile, buildLogsContent(params));
  const imgToTextData = fs.readFileSync(logImageToTextfile, {
    encoding: "utf8",
  });
  const textToImgData = fs.readFileSync(logTextToImagefile, {
    encoding: "utf8",
  });
  const logsData = marked.lexer(imgToTextData);
  const logsData2 = marked.lexer(textToImgData);
  const iterations = logsData.length;
  const readmeContent = buildReadmeContent(
    caption,
    iterations,
    logsData,
    logsData2,
    params
  );
  fs.writeFileSync(readmeFile, readmeContent);
}

function text2image(caption, sessionId) {
  const ws = new WebSocket(WS_ENDPOINT);

  ws.on("error", console.error);

  ws.on("open", function open() {
    console.log("[ws::open]");
  });

  ws.on("close", function close() {
    console.log("[ws::close]");
  });

  ws.on("message", function message(data) {
    const msg = JSON.parse(data.toString("utf8"));
    console.log("[ws::message::msg] ", msg.msg);

    if (msg.msg === "send_hash") {
      const payload_hash = {
        fn_index: 1,
        session_hash: sessionId,
      };
      ws.send(JSON.stringify(payload_hash), console.error);
    }

    if (msg.msg === "send_data") {
      const payload_data = {
        data: [
          caption.data.data[0],
          caption.data.data[0],
          caption.data.data[0],
          params["left-region"],
          params["center-region"],
          params["right-region"],
          params["overlap-region"],
          params["diffusion-steps"],
          params["random-seed"],
        ],
        fn_index: 1,
        session_hash: sessionId,
      };
      ws.send(JSON.stringify(payload_data), console.error);
      console.log("[ws::message::msg] params = ", params);
    }

    if (msg.msg === "process_completed") {
      console.log("complete message=", msg.success);
      resizeBase64({ base64Image: msg.output.data[0] })
        .then((res) => {
          saveImage(
            res,
            path.join(outputImagePath, getDateFormat() + "_" + "output.jpeg")
          );
        })
        .catch((err) => console.error(err));

      // update `README.md` & `logs-*.md` only if process is completed.
      updateFiles(caption);
    }
  });
}

module.exports = {
  text2image,
  params,
};
