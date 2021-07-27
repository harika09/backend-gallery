const aws = require("aws-sdk");
require("dotenv").config();

/* AWS config */
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new aws.S3({
  apiVersion: "2006-03-01",
  region,
  accessKeyId,
  secretAccessKey,
});

module.exports = s3;
