const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const config = require("config");
const PORT = config.get("port");

const cookieParser = require("cookie-parser");
const cookieMiddleware = require("./middleware/userCookie");

app.use(cookieParser());
app.use(cookieMiddleware());

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use("/", express.static(__dirname + "/public"));

app.get("*", (req, res) => {
  res.render("app");
});

server.listen(PORT, () => console.log("Server running on Port: " + PORT));
