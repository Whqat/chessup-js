import Square from "./plainBoard.js";
import SoundFX from "../sounds/soundfx.js";
import { didKingOrRookMove, changePlayer, checkIfValid, isKingChecked} from "./helperFunctions.js";

let playerTurn = document.querySelector("#player").textContent;
const Sounds = new SoundFX();

class Board {
    constructor(startPieces) {
        this.boardElement = document.querySelector("#gameboard");
        this.squares = [];
        this.light = true;
        this.row = 0;
        this.width = 8;
        this.createBoard(startPieces);
        this.addDragEventListeners();
    }

    createBoard(startPieces) {
        startPieces.forEach((piece, index) => {
            this.light = !this.light;
            const square = new Square(piece, index, this.row, this.light);
            this.light = square.color;
            this.squares.push(square);
            this.boardElement.append(square.element);
            this.row++;
            this.infoDisplay = document.querySelector("#info-display");
        });
    }

    addDragEventListeners() {
        this.squares.forEach((square) => {
            square.element.addEventListener("dragstart", this.dragStart.bind(this));
            square.element.addEventListener("dragover", this.dragOver.bind(this));
            square.element.addEventListener("drop", this.dragDrop.bind(this));
        });
    }

    dragStart(e) {
        this.startPositionId = e.target.parentNode.getAttribute("square-id");
        this.draggedElement = e.target;
    }

    dragOver(e) {
        e.preventDefault();
    }

    dragDrop(e) {
        e.stopPropagation();
        const correctTurn = this.draggedElement.firstChild?.classList.contains(playerTurn);
        const taken = e.target.classList.contains("piece");
        const opponentTurn = playerTurn === "white" ? "black" : "white";
        const takenByOpponent = e.target.firstChild?.classList.contains(opponentTurn);
        const valid = checkIfValid(this.startPositionId, e.target, this.draggedElement.id);
        const targetId = e.target.getAttribute("square-id") || e.target.parentNode.getAttribute("square-id");
        const kingCheckedAttribute = document.querySelector(`#king .${playerTurn}`).parentNode.getAttribute("checked");
        this.TARGET = parseInt(targetId)

        if (correctTurn) {
            // If square is occupied by an opponent's piece
            if (takenByOpponent && valid) {
                if (this.isPinned(this.draggedElement)) {return}
                if (this.validateCheckResponse(kingCheckedAttribute) === false) {return;}
                e.target.parentNode.append(this.draggedElement);
                e.target.remove();
                Sounds.playCaptureSound();
                isKingChecked(1, playerTurn);
                didKingOrRookMove(this.draggedElement);
                playerTurn = changePlayer(playerTurn);
                this.flipBoard()
                return;
            }
            // If square is occupied by one of your pieces
            if (taken && !takenByOpponent) {
                Sounds.playInvalidSound();
                return;
            }
            // If square is empty
            if (valid && !taken && !takenByOpponent) {
                if (this.isPinned(this.draggedElement)) {return}
                if (this.validateCheckResponse(kingCheckedAttribute) === false) {return;}
                e.target.append(this.draggedElement);
                Sounds.playMoveSound();
                isKingChecked(1, playerTurn);
                didKingOrRookMove(this.draggedElement);
                playerTurn = changePlayer(playerTurn);
                this.flipBoard()
                return;
            }
        }
    }

    flipBoard() {
        const currentTurn = playerTurn === "white" ? "black" : "white";
        if (currentTurn === "white") {
            document.querySelector("#gameboard").style.rotate = "180deg"
            document.querySelectorAll(".square").forEach((square) => {
                square.style.rotate = "180deg"
            })
        }
        else {
            document.querySelector("#gameboard").style.rotate = "0deg"
            document.querySelectorAll(".square").forEach((square) => {
                square.style.rotate = "0deg"
            })
        }
    }

    // Check if a piece's movement after a king check other than the king is able to cover the check
    coversCheck(piece) {
        const startId = this.startPositionId // initial square of the piece attempting to cover
        const targetId = document.querySelector(`[square-id="${this.TARGET}"]`) // piece's target square to attempt to cover the check
        const pieceToBeCaptured = targetId.firstChild // (if we're trying to capture the checking piece)
        if (pieceToBeCaptured?.classList.contains("piece")) {
            pieceToBeCaptured.remove()
        }
        targetId.appendChild(piece)
        // IF THE MOVE DOESN'T COVER CHECK:
        if (isKingChecked(3, playerTurn)) {
            targetId.removeChild(piece)
            document.querySelector(`[square-id="${startId}"]`).appendChild(piece)
            if (pieceToBeCaptured) {targetId.appendChild(pieceToBeCaptured)}
            return false;
        }
        // IF THE MOVE COVERS CHECK:
        targetId.removeChild(piece)
        document.querySelector(`[square-id="${startId}"]`).appendChild(piece)
        if (pieceToBeCaptured) {targetId.appendChild(pieceToBeCaptured)}
        document.querySelector(`#king .${playerTurn}`).parentNode.setAttribute("checked", false)
        return true;
    }

    // Check if a piece is pinned before moving it
    isPinned(piece) {
        if (piece.id === "king") {
            return false
        }
        const startId = this.startPositionId // initial square of the piece
        const targetId = document.querySelector(`[square-id="${this.TARGET}"]`) // target square
        const pieceToBeCaptured = targetId.firstChild // (if we're trying to capture a piece)
        const myKingPos = parseInt(document.querySelector(`#king .${playerTurn}`).parentNode.parentNode.getAttribute("square-id"))
        if (pieceToBeCaptured?.classList.contains("piece")) {
            pieceToBeCaptured.remove()
        }
        targetId.appendChild(piece)
        // IF PIECE IS PINNED: 
        if (isKingChecked(2, playerTurn, myKingPos)) {
            targetId.removeChild(piece)
            document.querySelector(`[square-id="${startId}"]`).appendChild(piece)
            if (pieceToBeCaptured) {targetId.appendChild(pieceToBeCaptured)}
            return true;
        }
        // IF PIECE ISNT PINNED
        targetId.removeChild(piece)
        document.querySelector(`[square-id="${startId}"]`).appendChild(piece)
        if (pieceToBeCaptured) {targetId.appendChild(pieceToBeCaptured)}
        document.querySelector(`#king .${playerTurn}`).parentNode.setAttribute("checked", false)
        return false;
    }

    // Validate player's response to a check (king's still checked / king no longer in check)
    validateCheckResponse() {
        const kingCheckedAttribute = document.querySelector(`#king .${playerTurn}`).parentNode.getAttribute("checked");
        if (kingCheckedAttribute === "true") {
            // If the dragged element is not the king, validate if it can cover the check
            if (this.draggedElement.getAttribute("id") !== "king") {
                if (this.coversCheck(this.draggedElement)) {
                    return true; // valid response (check blocked by a piece)
                }
                return false; // invalid response (piece being moved didnt block check)

            // If the dragged element is the king, validate if the king's new square isn't capturable
            } else if (this.draggedElement.getAttribute("id") === "king") {
                if (isKingChecked(2, playerTurn, this.TARGET)) {
                    return false; // invalid response to the check (moved king to capturable square)
                }
                return true; // valid response to the check (moved king to safety)
            }
        }
        return;
    }
}

export default Board;