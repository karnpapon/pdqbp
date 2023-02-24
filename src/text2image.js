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
} = require("../utils");
const { WS_ENDPOINT } = require("./const");

const outputImagePath = path.join(__dirname, "../images");
const readmeFile = path.join(__dirname, "../README.md");
const logfile = path.join(__dirname, "../logs.md");

const guidance_scale = rand(8);
const params = {
  "left-region": guidance_scale,
  "center-region": guidance_scale,
  "right-region": guidance_scale,
  "overlap-region": rand.intBetween(128, 320),
  "diffusion-steps": 50,
  "random-seed": rand(9999999),
};

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
    }

    if (msg.msg === "process_completed") {
      console.log("complete message=", msg.success);
      saveImage(
        msg.output.data[0],
        path.join(outputImagePath, getDateFormat() + "_" + "output.png")
      );

      // update `README.md` & `logs.md` only if process is completed.
      fs.appendFileSync(logfile, buildLogsContent(caption));
      const l = fs.readFileSync(logfile, { encoding: "utf8" });
      const logsData = marked.lexer(l);
      const iterations = logsData.length;
      const readmeContent = buildReadmeContent(
        caption,
        iterations,
        logsData,
        params
      );
      fs.writeFileSync(readmeFile, readmeContent);
    }
  });
}

module.exports = {
  text2image,
  params,
};
