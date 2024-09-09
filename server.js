const express = require('express')
const app = express();
const port = 9000;
const socket = require('socket.io')
const http = require("http")
const { Chess } = require("chess.js");
const path = require("path");
const { unwatchFile } = require('fs');

const server = http.createServer(app);
const io = socket(server);


const chess = new Chess();
let players = {};
let currPlayer = "w"
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.render("index", { title: "CHESS6969" })
})

io.on("connection", (uniquesocket) => {
    console.log("connected")
    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }
    else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b")
    }
    else {
        uniquesocket.emit("spectatorRole");
    }
    uniquesocket.on("disconnect", () => {
        if (uniquesocket.id == players.white) { delete players.white }
        else if (uniquesocket.id == players.black) { delete players.black }

    });
    uniquesocket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if (chess.turn() === "b" && uniquesocket.id !== players.black) return;
            const res = chess.move();
            if (res) {
                currPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen())
            }
            else {
                console.log("invalid move:", move);
                uniquesocket.emit("invalid move", move)
            }
        } catch (err) {
            console.log(err);
            uniquesocket.emit(move);
        }
    })
})
server.listen(6969, () => {
    console.log("server is running on port 6969...")
});
