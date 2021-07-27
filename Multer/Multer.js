const multerS3 = require("multer-s3");
const multer = require("multer");
const fs = require("fs");
const uuid = require("uuid").v4;
const path = require("path");
require("dotenv").config();

const s3 = require("./s3");
const bucketName = process.env.AWS_BUCKET_NAME;

const maxSize = 1024 * 1024 * 3; // 3MB Limit image upload

function fileFilter(req, file, cb) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
    console.log("File is not Supported");
    // req.flash("invalid", "File is not Supported");
  }
}

const Upload = multer({
  storage: multerS3({
    /* Save on AWS Storage */ s3,
    bucket: bucketName,
    ACL: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  }),
  limits: {
    fileSize: maxSize,
  },
  fileFilter: fileFilter,
}).single("image"); /* should be the same with formdata  */

module.exports = Upload;
