const PORT = 8000 || process.env.PORT;
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const { addInQ, createGame } = require("./logic/rooms");
const app = express();
require("./config/passport")(passport);
const httpServer = createServer(app);
const io = new Server(httpServer);

//DB config
const db = require("./config/keys").MongoURI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

//parsing
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//Routes
app.use("/play", require("./routes/play"));
app.use("/users", require("./routes/users"));
app.use("/", require("./routes/index.js"));

//socket
io.on("connection", (socket) => {
  socket.emit("msg", "Hello");
  socket.on("joingame", function (userinfo) {
    //io.emit("message", msg);
    //roomid = genRoomID()
    //console.log(roomid);
    gameInfo = addInQ(userinfo, socket.id);

    switch (gameInfo) {
      case "user-added":
        break;
      case "in-game":
        break;
      case "already-waiting":
        break;
      default:
        socket.emit("gameinfo", { oppn: gameInfo["W"], my_color: "B" });
        io.to(gameInfo["W"][0]).emit("gameinfo", {
          oppn: gameInfo["B"],
          my_color: "W",
        });
    }
    //socket.emit('roomid', roomid);
  });
  socket.on("move", (data) => {
    io.to(data["oppn_sockid"]).emit("playmove", { move: data["move"] });
  });
});

//Listen at Port

httpServer.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}/`);
});
