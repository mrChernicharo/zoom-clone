import express from "express";
import { Server } from "http";
import socketIO from "socket.io";
import url from "url";
import { ExpressPeerServer } from "peer";
import path from "path";
import { randomUUID } from 'crypto'
import config from './config.js'


const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const app = express();
const server = Server(app);
const io = socketIO(server);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer); // Now we just need to tell our application to server our server at "/peerjs".Now our server is up and running

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html")); // Send our Inro page file(index.js) which in the static folder.
});

app.get("/join", (req, res) => {
  res.redirect(
    url.format({
      pathname: `/join/${randomUUID()}`, // Here it returns a string which has the route and the query strings.
      query: req.query, // /join/A_unique_Number?Param=Params. -> get redirected to our old_Url/join/id?params
    })
  );
});

app.get("/joinold", (req, res) => {
  console.log("joinold", req.query);
  // intro page redirects us to /joinold route with our query strings(We reach here when we join a meeting)
  res.redirect(
    url.format({
      pathname: `join/${req.query.meeting_id}`,
      query: req.query,
    })
  );
});

app.get("/join/:rooms", (req, res) => {
  // render ejs file passing data
  res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, id, myname }) => {
    // When the socket a event 'join room' event
    socket.join(roomId);

    console.log(`${myname} joined room: ${roomId}!`);

    socket.to(roomId).broadcast.emit("user-connected", { id, myname }); // emit a 'user-connected' event to tell all the other users

    socket.on("messagesend", (message) => {
      console.log(`room: ${roomId}::${myname} said: ${message}`);
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("tellName", (myname) => {
      console.log(myname);
      socket.to(roomId).broadcast.emit("AddName", myname);
    });

    socket.on("disconnect", () => {
      console.log(`room: ${roomId}::${myname} disconnected!`);
      socket.to(roomId).broadcast.emit("user-disconnected", id);
    });
  });
});

const PORT = config.PORT || 3030;
server.listen(PORT, () => {
  console.log(`server listening at port ${PORT} 🎸`);
});


// NODE_ENV=prod node ./server.js