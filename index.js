const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const { image2text, sessionId } = require("./src/image2text");
const { text2image, params } = require("./src/text2image");
const { getReadmeContent, getLogContent } = require("./utils");
const readmeFile = path.join(__dirname, "./README.md");
const logfile = path.join(__dirname, "./logs.md");
const l = fs.readFileSync(logfile, { encoding: "utf8" });
const iterations = marked.lexer(l).length;

(async () => {
  try {
    const caption = await image2text();
    await text2image(caption.data.data, sessionId);
    let readMeContents = getReadmeContent(caption.data, params, iterations + 1);
    fs.appendFileSync(logfile, getLogContent(caption));
    fs.writeFileSync(readmeFile, readMeContents);
    console.log("data", caption.data);
  } catch (err) {
    console.error(err);
  }
})();
