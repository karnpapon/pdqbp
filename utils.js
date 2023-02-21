const fs = require("fs");

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

function getDateFormat() {
  const d = new Date();
  const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
  const month = d.getMonth() < 10 ? `0${d.getMonth()}` : d.getMonth();
  return `${d.getFullYear()}-${month}-${date}`; // ISO 8601 standard.
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
  binaryData = Buffer.from(base64Data, "base64").toString("binary");

  fs.writeFile(path, binaryData, "binary", function (err) {
    console.log(err); // writes out file without error, but it's not a valid image
  });
}

module.exports = {
  makeSessionId,
  getDateFormat,
  delay,
  base64toBlob,
  saveImage,
};
