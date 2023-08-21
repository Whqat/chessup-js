class SoundFX {
    constructor() {
        this.captureSound = document.getElementById("captureSound");
        this.moveSound = document.getElementById("moveSound");
        this.invalidSound = document.getElementById("invalidSound");
    }
    playCaptureSound() {
        this.captureSound.pause();
        this.captureSound.currentTime = 0;
        this.captureSound.play();
    }
    playInvalidSound() {
        this.invalidSound.pause();
        this.invalidSound.currentTime = 0;
        this.invalidSound.play();
    }
    playMoveSound() {
        this.moveSound.pause();
        this.moveSound.currentTime = 0;
        this.moveSound.play();
    }
}

export default SoundFX
