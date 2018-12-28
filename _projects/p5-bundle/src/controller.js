export default class Controller {
    constructor(width, height, p5) {
        this.running = true;
        this.firstIter = true;
        this.p5 = p5;
        this.width = width;
        this.height = height;
    }

    press() {
        if (this.running) {
            this.running = false;
            this.p5.noLoop();
        } else {
            this.running = true;
            this.p5.loop();
        }
    }

    overlay() {
        if (this.running == false) {
            this.p5.background('rgba(50%,50%,50%,0.5)');
            this.p5.fill(255);
            this.p5.noStroke();
            this.p5.rect(this.width / 2 - 15, this.height / 2, 20, 60);
            this.p5.rect(this.width / 2 + 15, this.height / 2, 20, 60);
        }

        if (this.firstIter) {
            this.p5.background('rgba(50%,50%,50%,0.5)');
            this.p5.fill(255);
            this.p5.noStroke();

            let size = 30;
            let xOffset = 10;
            this.p5.triangle(
                this.width / 2 - size + xOffset,
                this.height / 2 - size,
                this.width / 2 + size + xOffset,
                this.height / 2,
                this.width / 2 - size + xOffset,
                this.height / 2 + size
            );

            this.firstIter = false;
        }
    }
}
