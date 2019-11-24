let threshold = 5;
let node_size = 15;
let spikeColor;
let restColor;
let from;
let to;
let link;

let nodes = [];
let links = [];

let origin;
let x;
let y;
let activation;
let backgroundColor;
let impulseColor;
let vanishingLinks = [];

let clicked = false;

function mousePressed() {
    clicked = true;
    from.excite(true);
}

function setup() {
    createCanvas(250, 220);

    // GENERATE COLORS FIRST, THEY ARE USED INSIDE NODES
    spikeColor = color(255, 0, 50);
    restColor = color(0, 85, 225);
    impulseColor = color(255);
    backgroundColor = color(50);

    from = new Node(createVector(width / 2 - 90, height / 2), 0);
    to = new Node(createVector(width / 2 + 5, height / 2 + 10), 1);
    nodes.push(from);
    nodes.push(to);
    link = new Link(from, to);
    links.push(link);
    from.out.push(link);

    origin = createVector(width / 2 + 30, height / 2);
    x = new Axis(-5, 70, 'x');
    y = new Axis(-5, 100, 'y');
    activation = new Activation();
    to.out.push(activation);

    // let sink = createVector(to.pos.x + 40, to.pos.y + 100);
    // let outGoing = new VanishingLine(to, sink);
    // activation.out.push(outGoing);
    // vanishingLinks.push(outGoing);

    let sink = new Node(createVector(to.pos.x + 40, to.pos.y + 70));
    let outLink = new Link(to, sink);
    activation.out.push(outLink);
    nodes.push(sink);
    links.push(outLink);

    sink = new Node(createVector(to.pos.x + 76, to.pos.y + 50));
    outLink = new Link(to, sink);
    activation.out.push(outLink);
    nodes.push(sink);
    links.push(outLink);

    sink = new Node(createVector(to.pos.x + 90, to.pos.y + 20));
    outLink = new Link(to, sink);
    activation.out.push(outLink);
    nodes.push(sink);
    links.push(outLink);
}

function draw() {
    background(backgroundColor);

    if (clicked == false) {
        fill(255, 30);
        noStroke();
        textSize(40);
        text('CLICK to', 33, 70);
        text('SPIKE', 25, 170);
    }

    for (let outLink of links) {
        outLink.show();
        outLink.update();
    }
    for (let node of nodes) {
        node.show();
    }

    push(); // -------------------
    translate(origin);

    activation.show();
    activation.update();

    x.show();
    y.show();
    fill(255);
    let side = 2;
    let height = 99;
    triangle(-side, -height, side, -height, 0, -side * 2 - height);
    pop(); // --------------------
}

// to show the direction of the link, require some calculation but it's worth it.
function arrowhead(from, to, base, height, distance) {
    let rot = p5.Vector.sub(to.pos, from.pos).heading(); // get angle of the link
    push();
    translate(to.pos.x, to.pos.y); // move the origin to the target the arrow is pointing to
    rotate(rot); // rotate to align the tip
    noStroke(); // strong independent arrows need no border
    triangle(
        -distance / 2 - 1,
        0,
        -distance / 2 - height,
        -base,
        -distance / 2 - height,
        +base,
    );
    pop();
}

class Activation {
    constructor() {
        this.activation = 0;
        this.level = 0;
        this.dx = 0.05;
        this.magnification = 5;
        this.threshold = 3;
        this.dampening = 0;
        this.decay = 0.01;
        this.out = [];
        this.max_dampening = 14;
    }
    excite() {
        this.activation += 2;
    }

    update() {
        // let the bar grow until activation
        if (this.level < this.activation) {
            this.level += this.dx * 4;
        }

        // the bar has reached the activation and is above the threshold -> fire
        if (this.level > this.threshold + this.dampening) {
            for (let out of this.out) {
                out.excite();
            }
            this.activation -= this.threshold + this.dampening;
            this.level = 0;
            if (this.dampening < this.max_dampening) {
                this.dampening += 2;
            }
        }

        // the bar has reached the activation and is above the threshold -> fire
        if (this.level >= this.activation) {
            this.level = this.activation;

            if (this.activation > 0) {
                this.activation -= this.decay;
            }
            if (this.dampening > 0) {
                this.dampening -= this.decay / 2;
            }
            if (this.activation < 0) {
                this.activation = 0;
            }
            if (this.dampening < 0) {
                this.dampening = 0;
            }
        }
    }
    show() {
        stroke(100);
        let levelColor = lerpColor(
            restColor,
            spikeColor,
            this.level / (this.threshold + this.dampening),
        );

        to.color = levelColor;

        //Activation line for debugging
        //line(0, -this.activation * this.magnification, 40, -this.activation * this.magnification);

        // Level bar
        fill(levelColor);
        noStroke();
        rect(20, 0, 20, -this.level * this.magnification);

        // Threshold
        stroke(100);
        strokeWeight(1);
        line(
            0,
            -(this.threshold + this.dampening) * this.magnification,
            50,
            -(this.threshold + this.dampening) * this.magnification,
        );

        textAlign(RIGHT, CENTER);
        textSize(13);
        noStroke();
        fill(100);
        text(
            'Threshold',
            -2,
            -(this.threshold + this.dampening) * this.magnification,
        );
    }
}

class Axis {
    constructor(start, stop, dir) {
        this.dir = dir;
        this.start = start;
        this.stop = stop;
    }

    show() {
        stroke(255);
        strokeWeight(1);
        push();
        if (this.dir == 'y') {
            rotate(-PI / 2);
        }
        stroke(255);
        line(this.start, 0, this.stop, 0);
        pop();
    }
}

class Node {
    constructor(pos, id) {
        this.pos = pos;
        this.id = id;
        this.out = [];
        this.in = [];
        this.excited = false;
        this.color = restColor;
    }
    excite() {
        for (let edge of this.out) {
            edge.excite();
        }
    }
    show() {
        stroke(50);
        strokeWeight(1);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, node_size, node_size);
    }
}

class Link {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.impulses = [];
        this.speed = 2;
        this.length = p5.Vector.dist(this.from.pos, this.to.pos);
    }

    excite() {
        this.impulses.push(0);
    }

    show() {
        strokeWeight(1);
        if (this.impulses.length == 0) {
            stroke(100); // default is greyish
            fill(100);
        } else {
            stroke(110, 50, 50); // excited is reddish
            fill(110, 50, 50);
        }
        line(this.from.pos.x, this.from.pos.y, this.to.pos.x, this.to.pos.y);
        arrowhead(this.from, this.to, 4, 10, node_size - 3);

        for (let impulse of this.impulses) {
            let tmp = p5.Vector.lerp(
                this.from.pos,
                this.to.pos,
                impulse / this.length,
            );
            noStroke();
            fill(255);
            ellipse(tmp.x, tmp.y, 5, 5);
        }
    }

    update() {
        let new_travelers = [];

        for (let impulse of this.impulses) {
            let new_traveler = impulse + this.speed;
            if (new_traveler < this.length) {
                new_travelers.push(new_traveler);
            } else {
                // destination reached
                this.to.excite(false);
            }
        }
        this.impulses = new_travelers;
    }
}
