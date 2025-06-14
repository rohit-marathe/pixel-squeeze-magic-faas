"use strict";

const fs = require("fs");
const formidable = require("formidable");
const sharp = require("sharp");

module.exports = async (event, context) => {
  const form = new formidable.IncomingForm();

  return new Promise((resolve) => {
    form.parse(event.body, async (err, fields, files) => {
      if (err) {
        return resolve(context.status(500).succeed("Form parse error"));
      }

      const quality = parseInt(fields.quality || "80");
      const file = files.image;

      if (!file || !file.filepath) {
        return resolve(context.status(400).succeed("No file provided"));
      }

      try {
        const inputBuffer = fs.readFileSync(file.filepath);

        const compressed = await sharp(inputBuffer)
          .jpeg({ quality: quality })
          .toBuffer();

        const base64 = compressed.toString("base64");
        resolve(context
          .status(200)
          .succeed(base64));
      } catch (e) {
        resolve(context.status(500).succeed("Compression failed: " + e.message));
      }
    });
  });
};
