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
  console.log(req);

  if (req.file) {
    let video = req.file;
    console.log("Ta aqui");
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
  } else {
    res.json({
      uploaded: false
    });
  }
});

server.listen(PORT, () => console.log("Server running on Port: " + PORT));
