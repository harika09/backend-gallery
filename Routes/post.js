const express = require("express");
const multer = require("multer");
const router = express.Router();

const userPost = require("../Models/Post");
const Upload = require("../Multer/Multer");
const s3 = require("../Multer/s3");
const bucketName = process.env.AWS_BUCKET_NAME;

/* Read */
router.get("/data", async (req, res) => {
  const PAGE_LIMIT = 12;
  const page = parseInt(req.query.page || "0");
  const total = await userPost.countDocuments({});

  // res.json(res.paginatedResults);
  const post = await userPost
    .find({})
    .limit(PAGE_LIMIT)
    .skip(PAGE_LIMIT * page)
    .sort({ timestamp: -1 });

  res.json({
    totalPage: Math.ceil(total / PAGE_LIMIT),
    post,
  });
});

/* Post */
router.post("/post", async (req, res) => {
  Upload(req, res, (err) => {
    const { title } = req.body;

    try {
      const post = new userPost({ title: title });

      if (err instanceof multer.MulterError) {
        res.json({ error: "Image is too large" }); /* max of 3mb per image */
      } else {
        if (!title || !req.file) {
          res.json("Empty Fields"); /* check if inputs are empty  */
        } else {
          if (req.file) {
            /* check file if exist */
            post.image = req.file.location;
            post.imageKey = req.file.key;
            post.save((err) => {
              if (err) {
                res.send(err);
                console.log("Error");
              } else {
                res.json("Success");
                console.log("Success");
              }
            });
          }
        }
      }
    } catch (err) {
      res.json(err);
    }
  });
});

router.get("/details/:id", async (req, res) => {
  const requestedID = req.params.id;
  try {
    userPost.findById({ _id: requestedID }, (err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

/* Delete */
router.delete("/delete/:id", async (req, res) => {
  const requestedID = req.params.id;

  try {
    const requestedPost = await userPost.findById({ _id: requestedID });

    //AWS image Key
    const avatarKey = requestedPost.imageKey;

    const deleteParams = {
      Bucket: bucketName,
      Key: avatarKey,
    };

    //Delete image on AWS bucket
    s3.deleteObject(deleteParams, function (err) {
      if (err) {
        res.send(err);
      }
    });
    //Delete Post
    userPost.findByIdAndDelete({ _id: requestedID }).exec();
  } catch (err) {
    console.log(err);
  }
});

/* Edit */
router.post("/edit/:id", async (req, res) => {
  Upload(req, res, (err) => {
    const requestedID = req.params.id;
    const { title } = req.body;

    try {
      if (err instanceof multer.MulterError) {
        res.json({ error: "Image is too large" });
      } else if (err) {
        console.log("Error encountered");
      } else {
        /* Locate pose */
        userPost.findById({ _id: requestedID }, (err, data) => {
          if (err) {
            res.json(err);
          } else {
            let currentImageKey = "";
            let newImage = "";
            let newImageKey = "";

            /* if image is found */
            if (req.file) {
              newImage = req.file.location;
              newImageKey = req.file.key;
              currentImageKey = data.imageKey;

              //Delete image on AWS bucket
              const deleteParams = {
                Bucket: bucketName,
                Key: currentImageKey,
              };

              s3.deleteObject(deleteParams, function (err) {
                if (err) {
                  res.send(err);
                }
              });
            } else {
              /* If No Image added */
              newImage = data.image;
              newImageKey = data.imageKey;
            }

            if (!title) {
              /* If no changes on title resave the old Title */
              userPost.updateOne(
                { _id: requestedID },
                {
                  $set: {
                    image: newImage,
                    imageKey: newImageKey,
                  },
                },
                (err) => {
                  if (err) {
                    res.json(err);
                  } else {
                    res.json({ success: "Update Success" });
                  }
                }
              );
            } else {
              userPost.updateOne(
                { _id: requestedID },
                {
                  $set: {
                    title: title,
                    image: newImage,
                    imageKey: newImageKey,
                  },
                },
                (err) => {
                  if (err) {
                    res.json(err);
                  } else {
                    res.json({ success: "Update Success" });
                    console.log("no Update");
                  }
                }
              );
            }
          }
        });
      }
    } catch (err) {
      res.json(err);
    }
  });
});

module.exports = router;
