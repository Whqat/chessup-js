import { isUnsafeToGo, isValidCastling } from "./helperFunctions.js";

class PieceRules {
    constructor(boardWidth = 8) {
        this.width = boardWidth;
    }

    pawn(startId, targetId) {
        const starterRow = [9, 10, 11, 12, 13, 14, 15, 16];
        const startCol = (startId - 1) % this.width;
        const targetCol = (targetId - 1) % this.width;
        const colDiff = Math.abs(startCol - targetCol);
        // Prevent capturing a piece on the other edge of the board
        if (colDiff > 2) {
            return false;
        }

        if (
            // Moving two squares on start
            (starterRow.includes(startId) &&
                startId + this.width * 2 === targetId &&
                !document.querySelector(`[square-id='${startId + this.width}']`).firstChild &&
                !document.querySelector(`[square-id='${startId + this.width * 2}']`).firstChild) ||
            // Moving one square
            (startId + this.width === targetId &&
                !document.querySelector(`[square-id='${startId + this.width}']`).firstChild) ||
            // Capturing to the right
            (startId + this.width - 1 === targetId &&
                document.querySelector(`[square-id='${startId + this.width - 1}']`).firstChild) ||
            // Capturing to the left
            (startId + this.width + 1 === targetId &&
                document.querySelector(`[square-id='${startId + this.width + 1}']`).firstChild)
        ) {
            return true;
        }
        return false;
    }

    knight(startId, targetId) {
        const startRow = Math.floor((startId - 1) / this.width);
        const targetRow = Math.floor((targetId - 1) / this.width);
        const startCol = (startId - 1) % this.width;
        const targetCol = (targetId - 1) % this.width;
        const rowDiff = Math.abs(startRow - targetRow);
        const colDiff = Math.abs(startCol - targetCol);
        // Prevent jumping across the board
        if (rowDiff > 4 || colDiff > 4) {
            return false;
        }
        if (
            // Two squares up, one square to either side
            (startId + this.width * 2 + 1 === targetId ||
                startId + this.width * 2 - 1 === targetId ||
                // One square up, two squares to either side
                startId + this.width + 2 === targetId ||
                startId + this.width - 2 === targetId ||
                // Two squares back, one square to either side
                startId - this.width * 2 + 1 === targetId ||
                startId - this.width * 2 - 1 === targetId ||
                // One square back, two squares to either side
                startId - this.width + 2 === targetId ||
                startId - this.width - 2 === targetId) &&
            startId !== targetId
        ) {
            return true;
        }
        return false;
    }

    bishop(startId, targetId) {
        const startRow = Math.floor((startId - 1) / this.width);
        const targetRow = Math.floor((targetId - 1) / this.width);
        const startCol = (startId - 1) % this.width;
        const targetCol = (targetId - 1) % this.width;
        // Calculate distance between: (startRow & targetRow), (startCol & targetCol)
        const rowDiff = Math.abs(startRow - targetRow);
        const colDiff = Math.abs(startCol - targetCol);

        // Check if the movement is diagonal
        if (rowDiff !== colDiff) {
            return false;
        }

        const rowDir = startRow < targetRow ? 1 : -1;
        const colDir = startCol < targetCol ? 1 : -1;

        for (let i = 1; i < rowDiff; i++) {
            const row = startRow + i * rowDir;
            const col = startCol + i * colDir;
            const squareId = row * this.width + col + 1;

            // Check if any square on the diagonal path is occupied
            if (document.querySelector(`[square-id="${squareId}"]`)?.firstChild) {
                return false;
            }
        }
        if (startId !== targetId) {
            return true;
        }
    }

    rook(startId, targetId) {
        const startRow = Math.floor((startId - 1) / this.width);
        const targetRow = Math.floor((targetId - 1) / this.width);
        const startCol = (startId - 1) % this.width;
        const targetCol = (targetId - 1) % this.width;
        const rowDiff = Math.abs(startRow - targetRow);
        const colDiff = Math.abs(startCol - targetCol);
        let dir;

        if (rowDiff !== 0 && colDiff !== 0) {
            return false;
        }

        function checkMovement() {
            if (rowDiff === 0) {
                dir = "horizontal";
                const rowDir = targetCol > startCol ? 1 : -1;
                return {
                    direction: rowDir,
                    difference: colDiff,
                };
            } else {
                dir = "vertical";
                const colDir = targetRow > startRow ? 1 : -1;
                return {
                    direction: colDir,
                    difference: rowDiff,
                };
            }
        }

        const Rookmovement = checkMovement();

        for (let i = 1; i < Rookmovement.difference; i++) {
            // Horizontal movement
            if (dir == "horizontal") {
                const col = startId + i * Rookmovement.direction;

                if (document.querySelector(`[square-id="${col}"]`)?.firstChild) {
                    return false;
                }
            }
            // Vertical movement
            else {
                const row = startId + this.width * (i * Rookmovement.direction);

                if (document.querySelector(`[square-id="${row}"]`)?.firstChild) {
                    return false;
                }
            }
        }
        if (startId !== targetId) {
            return true;
        }
    }

    king(startId, targetId) {
        const startRow = Math.floor((startId - 1) / this.width);
        const targetRow = Math.floor((targetId - 1) / this.width);
        const startCol = (startId - 1) % this.width;
        const targetCol = (targetId - 1) % this.width;
        const rowDiff = Math.abs(startRow - targetRow);
        const colDiff = Math.abs(startCol - targetCol);
        // Prevent jumping across the board
        if (rowDiff > 2 || colDiff > 2) {
            return false;
        }

        if (
            (startId + this.width === targetId ||
                startId + this.width + 1 === targetId ||
                startId + this.width - 1 === targetId ||
                startId + 1 === targetId ||
                startId - 1 === targetId ||
                startId - this.width === targetId ||
                startId - this.width - 1 === targetId ||
                startId - this.width + 1 === targetId) &&
            !isUnsafeToGo(1, null, startId, targetId) &&
            startId !== targetId
        ) {
            return true;
        }
        
        const canCastle = isValidCastling(startId, targetId);

        if (canCastle) {
            return true;
        }
        return false;
    }

    queen(startId, targetId) {
        if (this.rook(startId, targetId) || this.bishop(startId, targetId)) {
            return true;
        }
        return false;
    }
}

export default PieceRules;