let WebSocketClient = require("websocket").client;
const fs = require("fs");
const path = require("path");

const client = new WebSocketClient();
const wsRequestUrl = "wss://albarji-mixture-of-diffusers.hf.space/queue/join";

// const test_base64 = path.join(__dirname, "./testbase64.txt");
// const test_base64_file = fs.readFileSync(test_base64, { encoding: "utf8" });

function saveImage(data) {
  let base64Data = data.replace(/^data:image\/png;base64,/, "");
  base64Data += base64Data.replace("+", " ");
  binaryData = Buffer.from(base64Data, "base64").toString("binary");

  fs.writeFile("out.png", binaryData, "binary", function (err) {
    console.log(err); // writes out file without error, but it's not a valid image
  });
}

client.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

client.on("connect", function (connection) {
  console.log("WebSocket Client Connected");
  connection.on("error", function (error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on("close", function () {
    console.log("echo-protocol Connection Closed");
  });
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      console.log("Received: '" + message.utf8Data + "'");
    }

    if (JSON.parse(message.utf8Data).msg === "send_hash") {
      const payload_hash = {
        fn_index: 1,
        session_hash: "bof0r3okyse",
      };

      connection.send(JSON.stringify(payload_hash), (err) => {
        console.log("[ws:send_hash:error]: ", err);
      });
    }

    if (JSON.parse(message.utf8Data).msg === "send_data") {
      const payload_data = {
        data: [
          "people playing a game of frisbee ",
          "people playing a game of frisbee ",
          "people playing a game of frisbee ",
          2,
          2,
          4,
          256,
          15,
          12345,
        ],
        fn_index: 1,
        session_hash: "bof0r3okyse",
      };

      connection.send(JSON.stringify(payload_data), (err) => {
        console.log("[ws:send_data:error]: ", err);
      });
    }

    if (JSON.parse(message.utf8Data).msg === "process_completed") {
      // because the string is guaranteed to have one quote.
      // `slice` less overhead than a regular expression.
      saveImage(message.output.data[0].slice(1, -1));
    }
  });
});

client.connect(wsRequestUrl);
