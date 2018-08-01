const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const config = require("config");
const PORT = config.get("port");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const cookieMiddleware = require("./middleware/userCookie");
const fs = require("fs");
const path = require("path");
const hbjs = require("handbrake-js");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use("/", express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(cookieMiddleware());

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.resolve(__dirname, "uploads"));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.get("*", (req, res) => {
  res.render("app");
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    let video = req.file;
    let upload_path = path.join(__dirname, "/uploads/");

    fs.exists(upload_path, exists => {
      if (!exists) {
        fs.mkdir(upload_path, function(err) {
          if (err) {
            return console.error(err);
          }
          res.json({
            uploaded: true,
            path: video.filename
          });
        });
      } else {
        res.json({
          uploaded: true,
          path: video.filename
        });
      }
    });
    createEncodeDir();
  } else {
    res.json({
      uploaded: false
    });
  }
});

let createEncodeDir = () => {
  let dir = path.join(__dirname, "/encoded/");
  fs.exists(dir, exists => {
    if (!exists) {
      fs.mkdir(dir, function(err) {
        if (err) {
          return console.error(err);
        }
      });
    }
  });
};

io.on("connection", socket => {
  socket.on("encode", data => {
    let handbrake,
      completed = false,
      file = data.file,
      convert_ext = data.convert_ext,
      input = path.join(__dirname, "/encoded/", file),
      encoded_file = file + "_to_." + convert_ext,
      output = PATH.JOIN(__dirname, "/encoded/", encoded_file);

    handbrake = hbjs
      .spawn({ input, output, preset: "Universal" })
      .on("progress", progress => {
        socket.emit("progress", {
          percentage: progress.percentComplete,
          eta: process.eta
        });
      })
      .on("complete", () => {
        completed = true;
        socket.emit("complete", {
          encoded_file
        });
      });

    socket.on("disconnect", () => {
      if (!completed) {
        console.log("Not completed");
        handbrake.cancel();
        deleteVideo(input);
        deleteVideo(output);
      }
    });
  });
});

let deleteVideo = path => {
  fs.unlink(path, err => {
    if (err) throw err;
  });
};
server.listen(PORT, () => console.log("Server running on Port: " + PORT));
