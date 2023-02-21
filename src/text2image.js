const WebSocket = require("ws");
const path = require("path");
const { saveImage, getDateFormat } = require("../utils");

const WS_ENDPOINT = "wss://albarji-mixture-of-diffusers.hf.space/queue/join";
const OUTPUT_IMAGE_PATH = path.join(__dirname, "../images");

function text2image(caption_data, sessionId) {
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
          caption_data,
          caption_data,
          caption_data,
          2,
          2,
          4,
          256,
          15,
          12345,
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
        path.join(OUTPUT_IMAGE_PATH, getDateFormat() + "_" + "output.png")
      );
    }
  });
}

module.exports = text2image;
