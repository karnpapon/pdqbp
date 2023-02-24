const fs = require("fs");
const {
  ENTRY_POINT_DATA_DATE,
  INITIAL_INPUT_1,
  INITIAL_INPUT_2,
} = require("./src/const");

function makeSessionId(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function getDateFormat(offsetDate = 0) {
  const d = new Date();
  const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
  const month =
    d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1; // +1 since getMonth start at zero
  return `${d.getFullYear()}-${month}-${date + offsetDate}`; // ISO 8601 standard.
}

function delay(number) {
  return new Promise((resolve) => setTimeout(resolve, number));
}

function base64toBlob(base64Data, contentType) {
  contentType = contentType || "";
  let sliceSize = 1024;
  const byteCharacters = Buffer.from(base64Data, "base64");
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  let byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    let begin = sliceIndex * sliceSize;
    let end = Math.min(begin + sliceSize, bytesLength);

    let bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

function saveImage(data, path) {
  let base64Data = data.replace(/^data:image\/png;base64,/, "");
  base64Data += base64Data.replace("+", " ");
  const binaryData = Buffer.from(base64Data, "base64").toString("binary");

  fs.writeFile(path, binaryData, "binary", function (err) {
    console.log(err); // writes out file without error, but it's not a valid image
  });
}

function writeFile(path, contents) {
  fs.writeFile(path, contents, "utf8", function (err) {
    console.log(err);
  });
}

function getReadmeContent(_data, _data2, it, date) {
  // const date = getDateFormat();
  const data = JSON.stringify(_data || {}, null, 2);
  const data2 = JSON.stringify(_data2 || {}, null, 2);
  const iterations = it;
  return `<table><tr><td colspan="2"><img src="./images/${date}_output.png"></td></tr></tr><tr colspan="2"><tr></tr><td>\n\n\`\`\`json\n${data}\n\`\`\`\n</td><td>\n\n\`\`\`json\n${data2}\n\`\`\`\n</td></tr><tr colspan="2"></tr></tr><td colspan="2"><b>iterations</b> : ${iterations}</td></table>\n`;
}

function buildReadmeContent(caption, iterations, logsData, params) {
  const title = "### [`pdqbp`](/about.md)\n\n";
  let bodies = "";
  const entry = buildReadmeInitialBody();

  if (logsData.length > 0) {
    for (let i = iterations - 1; i >= 0; i--) {
      const d = i === iterations ? caption.data : logsData[i].text;
      bodies += getReadmeContent(
        i === iterations ? caption.data : JSON.parse("{" + d + "}"),
        params,
        i + 1,
        i === iterations
          ? getDateFormat()
          : d.split(":")[0].replace(/['"]+/g, "")
      );
    }
  }

  return title + bodies + entry;
}

function buildReadmeInitialBody() {
  let initData = getReadmeContent(
    INITIAL_INPUT_1,
    INITIAL_INPUT_2,
    "entry",
    ENTRY_POINT_DATA_DATE
  );

  return initData;
}

function buildLogsContent(caption) {
  return `\`\`\`json\n"${getDateFormat()}":${JSON.stringify(
    caption.data
  )}\n\`\`\`\n`;
}

function getPrevData(logsData) {
  return logsData.length > 0
    ? logsData[logsData.length - 1].text.split(":")[0].replace(/['"]+/g, "")
    : ENTRY_POINT_DATA_DATE;
}

module.exports = {
  makeSessionId,
  getDateFormat,
  delay,
  base64toBlob,
  saveImage,
  writeFile,
  getReadmeContent,
  buildLogsContent,
  buildReadmeContent,
  buildReadmeInitialBody,
  getPrevData,
};
