const path = require("path");
const { getDateFormat } = require("../utils");
const OUTPUT_IMAGE_PATH = path.join(__dirname, "../images");
const sessionId = "12vsfj3ixsFv";

console.log(
  "OUTPUT_IMAGE_PATH",
  path.join(
    OUTPUT_IMAGE_PATH,
    getDateFormat() + "_" + "output" + "_" + sessionId + ".png"
  )
);
