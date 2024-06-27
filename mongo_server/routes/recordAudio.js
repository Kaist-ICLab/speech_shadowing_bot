const express = require("express");
const path = require("path");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

recordRoutes.route("/").get(function (req, res) {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// This section will help you get a list of all the recordings.
recordRoutes.route("/recordAudio").get(async function (req, res) {
  let db_connect = dbo.getDb();

  db_connect
    .collection("userStudyDb")
    .find({})
    .toArray()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "An error occurred" });
    });
});

// This section will help you get a single record by id
recordRoutes.route("/recordAudio/:id").get(async function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { _id: new ObjectId(req.params.id) };
  await db_connect
    .collection("userStudyDb")
    .findOne(myquery, function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

// This section will help you create a new record.
recordRoutes.route("/recordAudio/add").post(async function (req, response) {
  let db_connect = dbo.getDb();
  let myobj = {
    user: req.body.user,
    originalText: req.body.originalText,
    transcribedText: req.body.transcribedText,
    level: req.body.level,
    theme: req.body.theme,
    timestamp: req.body.timestamp,
  };
  await db_connect
    .collection("userStudyDb")
    .insertOne(myobj, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
});

module.exports = recordRoutes;
