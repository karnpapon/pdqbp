const WebSocket = require("ws");
const path = require("path");
const rand = require("random-seed").create();
const { saveImage, getDateFormat } = require("../utils");

const WS_ENDPOINT = "wss://albarji-mixture-of-diffusers.hf.space/queue/join";
const OUTPUT_IMAGE_PATH = path.join(__dirname, "../images");

const guildance_scale = rand(8);
const _params = {
  "left-region": guildance_scale,
  "center-region": guildance_scale,
  "right-region": guildance_scale,
  "overlap-region": 256,
  "diffusion-steps": 50,
  "random-seed": rand(9999999),
};

function text2image(caption_data, sessionId) {
  const ws = new WebSocket(WS_ENDPOINT);

  ws.on("error", console.error);

  ws.on("open", function open() {
    console.log("[ws::open]");
    // _params["left-region"] = 8;
    // _params["center-region"] = 8;
    // _params["right-region"] = 8;
    // _params["overlap-region"] = 256;
    // _params["diffusion-steps"] = 50;
    // _params["random-seed"] = rand(9999999);
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
          caption_data[0],
          caption_data[0],
          caption_data[0],
          _params["left-region"],
          _params["center-region"],
          _params["right-region"],
          _params["overlap-region"],
          _params["diffusion-steps"],
          _params["random-seed"],
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

module.exports = {
  text2image,
  params: _params,
};
