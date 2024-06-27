const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let _db;

module.exports = {
  connectToServer: async function (callback) {
    try {
      if (!_db) {
        await client.connect();
        _db = client.db("sessions");
        console.log("Connected to the database");
      }
    } catch (e) {
      console.error(e);
    }

    if (_db) {
      callback();
    } else {
      callback("Error connecting to the database");
    }
  },
  getDb: function () {
    return _db;
  },
};
