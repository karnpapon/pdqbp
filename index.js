const { image2text, sessionId } = require("./src/image2text");
const text2image = require("./src/text2image");

(async () => {
  try {
    const caption = await image2text();
    await text2image(caption.data.data, sessionId);
    console.log("data", caption.data);
    // saveImage();
  } catch (err) {
    console.error(err);
  }
})();
