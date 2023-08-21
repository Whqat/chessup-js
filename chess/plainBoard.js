class Square {
    constructor(piece, index, row, color) {
        this.element = document.createElement("div");
        this.element.classList.add("square");
        this.element.setAttribute("square-id", `${64 - index}`);
        this.element.innerHTML = piece;
        this.element.firstChild?.setAttribute("draggable", true);
        this.color = this.checkeredPattern(row, color);
        this.element.classList.add(this.color ? "lightSquare" : "darkSquare");
        this.setPieceColor(index);
    }

    checkeredPattern(row, color) {
        if (row % 8 === 0) {
            color = !color;
        }
        return color;
    }

    setPieceColor(index) {
        if (`${index + 1}` <= 16) {
            this.element.firstChild.firstChild.classList.add("black");
        }

        if (`${index + 1}` >= 49) {
            this.element.firstChild.firstChild.classList.add("white");
        }
    }
}

export default Square