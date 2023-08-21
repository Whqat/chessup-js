import PieceRules from "./pieceRules.js";
const movement = new PieceRules();

// pieceRules.js:

export const isValidCastling = (startId, targetId) => {
    let playerDisplay = document.querySelector("#player");
    let playerTurn = playerDisplay.textContent;
    const kingStartPosition = playerTurn === "white" ? 4 : 5;
    const kingSideRookPosition = playerTurn === "white" ? 1 : 8;
    const queenSideRookPosition = playerTurn === "white" ? 8 : 1;

    // Flip signs if playerTurn is black
    const sign = playerTurn === "black" ? -1 : 1;

    // Check if the king is trying to castle
    if (startId === kingStartPosition) {
        // King-side castling
        if (targetId === kingStartPosition - 2 * sign) {
            // Check if there are no pieces between the king and the rook
            if (
                !document.querySelector(`[square-id="${kingStartPosition - sign}"]`).firstChild &&
                !document.querySelector(`[square-id="${kingStartPosition - 2 * sign}"]`).firstChild
            ) {
                // Check if the king and rook have not moved previously
                if (
                    !document
                        .querySelector(`[square-id="${kingStartPosition}"]`)
                        .firstChild.getAttribute("moved") &&
                    !document
                        .querySelector(`[square-id="${kingSideRookPosition}"]`)
                        .firstChild.getAttribute("moved")
                ) {
                    // Check if the king is not in check
                    if (
                        !isUnsafeToGo(1, null, startId, targetId) &&
                        !isUnsafeToGo(2, "short", startId, targetId)
                    ) {
                        // Move the rook
                        const rookTargetId = kingStartPosition - sign;
                        const rookStartPosition = kingSideRookPosition;
                        const kingSideRook = document.querySelector(
                            `[square-id="${rookStartPosition}"]`
                        ).firstChild;
                        kingSideRook.remove();
                        document
                            .querySelector(`[square-id="${rookTargetId}"]`)
                            .append(kingSideRook);
                        return true;
                    }
                }
            }
        }
        // Queen-side castling
        else if (targetId === kingStartPosition + 2 * sign) {
            // Check if there are no pieces between the king and the rook
            if (
                !document.querySelector(`[square-id="${kingStartPosition + sign}"]`).firstChild &&
                !document.querySelector(`[square-id="${kingStartPosition + 2 * sign}"]`)
                    .firstChild &&
                !document.querySelector(`[square-id="${kingStartPosition + 3 * sign}"]`).firstChild
            ) {
                // Check if the king and rook have not moved previously
                if (
                    !document
                        .querySelector(`[square-id="${kingStartPosition}"]`)
                        .firstChild.getAttribute("moved") &&
                    !document
                        .querySelector(`[square-id="${queenSideRookPosition}"]`)
                        .firstChild.getAttribute("moved")
                ) {
                    // Check if the king is not in check
                    if (
                        !isUnsafeToGo(1, null, startId, targetId) &&
                        !isUnsafeToGo(2, "long", startId, targetId)
                    ) {
                        // Move the rook
                        const rookTargetId = kingStartPosition + sign;
                        const rookStartPosition = queenSideRookPosition;
                        const queenSideRook = document.querySelector(
                            `[square-id="${rookStartPosition}"]`
                        ).firstChild;
                        queenSideRook.remove();
                        document
                            .querySelector(`[square-id="${rookTargetId}"]`)
                            .append(queenSideRook);
                        return true;
                    }
                }
            }
        }
        return false;
    }
};

export function isUnsafeToGo(x = 1, y = null, startId, targetId) {
    if (x === 1) {
        const playerTurn =
            document.querySelector("#player").textContent === "white" ? "white" : "black";
        const opponent = playerTurn === "white" ? "black" : "white";
        const oppPieces = document.querySelectorAll(`.piece .${opponent}`);
        for (let i = 0; i < oppPieces.length; i++) {
            const oppPiece = oppPieces[i].parentNode.getAttribute("id");
            const oppPieceId = parseInt(
                oppPieces[i].parentNode.parentNode.getAttribute("square-id")
            );

            // Check if the opponent's piece can capture the king
            // Handle pawn as an exception due to the necessary presence of a piece on the pawn's capturable square
            if (oppPiece === "pawn") {
                if (oppPieceId - 8 + 1 === targetId || oppPieceId - 8 - 1 === targetId) {
                    return true;
                }
            }
            if (canPieceCaptureKing(oppPieceId, targetId, oppPiece) === true) {
                // King would be in check if moved to that square
                document.getElementById("invalidSound").play();
                return true;
            }
        }
        // King is not in check
        return false;
    } else if (x === 2) {
        const playerTurn =
            document.querySelector("#player").textContent === "white" ? "white" : "black";
        const opponent = playerTurn === "white" ? "black" : "white";
        const oppPieces = document.querySelectorAll(`.piece .${opponent}`);
        for (let i = 0; i < oppPieces.length; i++) {
            const oppPiece = oppPieces[i].parentNode.getAttribute("id");
            const oppPieceId = parseInt(
                oppPieces[i].parentNode.parentNode.getAttribute("square-id")
            );

            if (y === "short") {
                // Handle pawn as an exception due to the necessary presence of a piece on the pawn's capturable square
                if (oppPiece === "pawn") {
                    if (oppPieceId - 8 + 1 === targetId || oppPieceId - 8 - 1 === targetId) {
                        return true;
                    }
                }
                if (
                    canPieceCaptureKing(oppPieceId, targetId, oppPiece) ||
                    canPieceCaptureKing(oppPieceId, targetId + 1, oppPiece) ||
                    canPieceCaptureKing(oppPieceId, startId, oppPiece) === true
                ) {
                    // King is in check
                    document.getElementById("invalidSound").play();
                    return true;
                }
            } else if (y === "long") {
                // Handle pawn as an exception due to the necessary presence of a piece on the pawn's capturable square
                if (oppPiece === "pawn") {
                    if (oppPieceId - 8 + 1 === targetId || oppPieceId - 8 - 1 === targetId) {
                        return true;
                    }
                }
                if (
                    canPieceCaptureKing(oppPieceId, targetId, oppPiece) ||
                    canPieceCaptureKing(oppPieceId, targetId - 1, oppPiece) ||
                    canPieceCaptureKing(oppPieceId, startId, oppPiece) === true
                ) {
                    // King is in check
                    document.getElementById("invalidSound").play();
                    return true;
                }
            }

            // Check if the opponent's piece can capture the king
        }
        // King is not in check
        return false;
    }
}

// chess.js:

// Checks if king is in check after every move based on 2 variations
export function isKingChecked(x, playerTurn, kingTarget = null) {
    // variation 1: checks if the move I just made checks the opponent king before the turn is passed
    if (x === 1) {
        const me = playerTurn === "white" ? "white" : "black";
        const opponent = playerTurn === "white" ? "black" : "white";
        const kingPos = parseInt(
            document
                .querySelector(`#king .${opponent}`)
                ?.parentNode.parentNode.getAttribute("square-id")
        );

        const myPieces = document.querySelectorAll(`.piece .${me}`);
        for (let i = 0; i < myPieces.length; i++) {
            const myPiece = myPieces[i].parentNode.getAttribute("id");
            const myPieceId = parseInt(myPieces[i].parentNode.parentNode.getAttribute("square-id"));

            // Check if my piece can capture the opponent king
            if (canPieceCaptureKing(myPieceId, kingPos, myPiece) === true) {
                // King is in check
                document.getElementById("startSound").play();
                document
                    .querySelector(`#king .${opponent}`)
                    .parentNode.setAttribute("checked", true);
                return true;
            }
        }
        // King is not in check
        return false;
    }
    // variation 2: checks if the opponent's piece can capture the square my king is trying to go to
    else if (x === 2) {
        const opponent = playerTurn === "white" ? "black" : "white";
        const oppPieces = document.querySelectorAll(`.piece .${opponent}`);
        for (let i = 0; i < oppPieces.length; i++) {
            const oppPiece = oppPieces[i].parentNode.getAttribute("id");
            const oppPieceId = parseInt(
                oppPieces[i].parentNode.parentNode.getAttribute("square-id")
            );

            // Check if the opponent's piece can capture the king's target square
            if (canPieceCaptureKing(oppPieceId, kingTarget, oppPiece) === true) {
                // King's target square is capturable therefor he's disallowed from going there
                document.getElementById("startSound").play();
                return true;
            }
        }
        // King would be safe on target square, let him go there
        return false;
    }
    // variation 3: check if opponent's move actually covers the check, used with coversCheck() func
    else if (x === 3) {
        const opponent = playerTurn === "white" ? "black" : "white";
        const oppPieces = document.querySelectorAll(`.piece .${opponent}`);
        const myKingPos = parseInt(
            document
                .querySelector(`#king .${playerTurn}`)
                .parentNode.parentNode.getAttribute("square-id")
        );
        for (let i = 0; i < oppPieces.length; i++) {
            const oppPiece = oppPieces[i].parentNode.getAttribute("id");
            const oppPieceId = parseInt(
                oppPieces[i].parentNode.parentNode.getAttribute("square-id")
            );

            // Check if the opponent's piece can still capture the king
            if (canPieceCaptureKing(oppPieceId, myKingPos, oppPiece) === true) {
                // King's current position is capturable, therefor the check wasn't covered
                document.getElementById("startSound").play();
                return true;
            }
        }
        // The check is covered succesfully
        return false;
    }
}

export function canPieceCaptureKing(startId, kingPos, piece) {
    if (movement[piece](startId, kingPos)) {
        return true;
    } else {
        return false;
    }
}

export function checkIfValid(start, target, piece) {
    const targetId =
        Number(target.getAttribute("square-id")) ||
        Number(target.parentNode.getAttribute("square-id"));
    const startId = Number(start);

    switch (piece) {
        case "pawn":
            return movement.pawn(startId, targetId);

        case "knight":
            return movement.knight(startId, targetId);

        case "bishop":
            return movement.bishop(startId, targetId);

        case "rook":
            return movement.rook(startId, targetId);

        case "queen":
            return movement.queen(startId, targetId);

        case "king":
            return movement.king(startId, targetId);
    }
}

export function didKingOrRookMove(draggedElement) {
    if (
        draggedElement.getAttribute("id") === "king" ||
        draggedElement.getAttribute("id") === "rook"
    ) {
        draggedElement.setAttribute("moved", true);
    }
    if (draggedElement.getAttribute("id") === "king") {
        draggedElement.setAttribute("checked", false);
    }
}

export function changePlayer(playerTurn) {
    playerTurn = playerTurn === "white" ? "black" : "white";

    if (playerTurn === "black") {
        revertIds();
    } else {
        reverseIds();
    }
    document.querySelector("#player").innerText = playerTurn;
    return playerTurn;
}

function reverseIds() {
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square, index) => square.setAttribute("square-id", 64 - index));
}

function revertIds() {
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square, index) => square.setAttribute("square-id", index + 1));
}
