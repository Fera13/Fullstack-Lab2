const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const album = require("./Albums");
require("dotenv").config();

const port = process.env.PORT || 3000;
const uri = process.env.URI;

app.use(express.json());
app.use(bodyParser.json());

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((error) => console.error("Error in the connection", error));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/albums", async (req, res) => {
  try {
    const albums = await album.find();
    console.log(albums);
    res.json(albums);
  } catch (error) {
    res.status(500).json("Error in getting the albums");
  }
});

app.post("/api/albums", async (req, res) => {
  try {
    const info = req.body;
    const existingAlbum = await album.findOne({ title: info.title });
    if (existingAlbum) {
      return res.status(409).send({ message: "Album already exists" });
    }
    const newAlbum = new album({
      title: info.title,
      artist: info.artist,
      year: info.year,
    });
    await newAlbum.save();
    res.status(201).send(newAlbum);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.put("/api/albums/:id", async (req, res) => {
  try {
    var id = req.params.id;
    const albumToUpdate = req.body;
    await album
      .findByIdAndUpdate(id, albumToUpdate)
      .then(() => {
        res.sendStatus(200);
        console.log("Updated");
      })
      .catch((error) => {
        res.status(404).send({ status: "error", message: error });
      });
  } catch (error) {}
});

app.delete("/api/albums/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await album.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (error) {
    res.status(404);
  }
});

app.get("/api/albums/:title", async (req, res) => {
  try {
    const title = req.params.title;
    await album.find({ title: title }).then((result) => {
      res.status(200).json(result);
    });
  } catch (error) {
    res.status(404);
  }
});

app.listen(port);
