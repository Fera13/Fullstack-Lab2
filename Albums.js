const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  year: { type: String, required: true },
});

module.exports = new mongoose.model("albums", albumSchema);
