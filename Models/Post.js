const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
  imageKey: {
    type: String,
    require: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const postModel = new mongoose.model("Post", postSchema);

module.exports = postModel;
