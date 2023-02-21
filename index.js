const { image2text, sessionId } = require("./src/image2text");
const text2image = require("./src/text2image");
const { writeFile, getDateFormat } = require("./utils");

let readMeContents = `## [digital-resonance](/README.md)\n\n<img src="./images/${getDateFormat()}_output.png">\n`;

(async () => {
  try {
    const caption = await image2text();
    await text2image(caption.data.data, sessionId);
    writeFile("./README.md", readMeContents);
    console.log("data", caption.data);
  } catch (err) {
    console.error(err);
  }
})();
