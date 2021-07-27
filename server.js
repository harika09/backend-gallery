const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");

require("dotenv").config();

const app = express();

/* Middle Wares */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 4000;

/* Routes */
const postData = require("./Routes/post");
app.use("/post", postData);

/* Database connection */
const uri = process.env.Database;
mongoose.connect(
  uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, database) => {
    if (err) {
      res.send(err);
    } else {
      db = database;
      app.listen(port, () => {
        console.log(
          "Sever is running at " + port + " and connected to the database"
        );
      });
    }
  }
);
