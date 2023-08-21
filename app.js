import Board from "./chess/chess.js"

const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn, 
    '', '', '', '', '', '', '', '',  
    '', '', '', '', '', '', '', '',  
    '', '', '', '', '', '', '', '',  
    '', '', '', '', '', '', '', '',  
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn, 
    rook, knight, bishop, queen, king, bishop, knight, rook,
]

const chess = new Board(startPieces)