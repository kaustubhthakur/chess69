const socket = io()
const chess = new Chess();
const boardElement = document.querySelector(".chessboard")
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((r, ridx) => {
        r.forEach((sq, sqidx) => {
            const sqele = document.createElement("div")
            sqele.classList.add("square",
                (ridx + sqidx) % 2 == 0 ? "light" : "dark"
            );
            sqele.dataset.row = ridx;
            sqele.dataset.col = sqidx;
            if (sq) {
                const pieceEle = document.createElement("div");
                pieceEle.classList.add("piece", sq.color == "w" ? "white" : "black")

                pieceEle.innerText = getPieceUnicode(sq);
                pieceEle.draggable = playerRole === sq.color;
                pieceEle.addEventListener("dragstart", (e) => {
                    if (pieceEle.draggable) {
                        draggedPiece = pieceEle;
                        sourceSquare = { r: ridx, col: sqidx }
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceEle.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });
                sqele.appendChild(pieceEle);
            };
            sqele.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            sqele.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetsrc = {
                        row: parseInt(sqele.dataset.row),
                        col: parseInt(sqele.dataset.col)
                    }
                    handleMove(sourceSquare,targetsrc);
                }
            })
            boardElement.appendChild(sqele)
        });

    });

}
const handleMove = (src, target) => {
    const move = {
        from: `${String.fromCharCode(97 + src.col)}${8 - src.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q",
    }
    socket.emit("move", move);
}
const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙",
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔",
        P: "♟",
        R: "♜",
        N: "♞",
        B: "♝",
        Q: "♛",
        K: "♚",
    }
    return unicodePieces[piece.type] || "";
}
socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard()
});
socket.on("spectatorRole", () => {
    playerRole = null
    renderBoard();
})
socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
})
socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
})
renderBoard()