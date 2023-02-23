const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const { image2text, sessionId } = require("./src/image2text");
const { text2image } = require("./src/text2image");
const { getPrevData } = require("./utils");

const logfile = path.join(__dirname, "./logs.md");
const l = fs.readFileSync(logfile, { encoding: "utf8" });
const logsData = marked.lexer(l);
const prevDataDate = getPrevData(logsData);

(async () => {
  try {
    const caption = await image2text(prevDataDate);
    await text2image(caption, sessionId);
    console.log("data", caption.data);
  } catch (err) {
    console.error(err);
  }
})();
