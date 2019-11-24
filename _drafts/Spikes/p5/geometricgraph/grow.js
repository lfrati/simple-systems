let num_nodes = 30;
let max_links = num_nodes * (num_nodes - 1);
let nodes = [];
let links = [];
let inhibition;
let cur_impulses;
let ID = 0;
let adj;
let node_diameter = 10;
let slider;
let spikeColor;
let restColor;
let buffer = 50;

let locality = 10;
let t = 0;
let dt = 0.002;
let focused = false;
let plots;
let plot_links = [];
let plot_comps = [];
let components;
let clicked = false;

function ui() {
    let cnv = createCanvas(400, 400);

    cnv.mousePressed(() => {
        makeNodes();
        localWire();
    });

    spikeColor = color(255, 0, 50);
    restColor = color(0, 65, 225);
    plots = createGraphics(width, height);
    plots.clear();
}

function makeNodes() {
    t = 0;
    plot_links = [];
    plot_comps = [];
    nodes = [];
    ID = 0;

    for (let i = 0; i < num_nodes; i++) {
        let x = buffer + random(width - buffer * 2);
        let y = buffer + random(height - buffer * 3);
        let pos = createVector(x, y);
        nodes.push(new Node(pos, ID));
        ID += 1;
    }
}

function mousePressed() {
    clicked = true;
}

function setup() {
    textAlign(CENTER);
    ui();
    makeNodes();
    localWire();
}

function localWire() {
    links = [];

    for (let node of nodes) {
        node.out = [];
        node.in = [];
    }

    for (let from of nodes) {
        for (let to of nodes) {
            if (to != from) {
                let d = dist(from.pos.x, from.pos.y, to.pos.x, to.pos.y);
                if (d < locality) {
                    let link = new Link(from, to);
                    links.push(link); // to iterate over them
                    from.out.push(link); // to excite neighbors
                    to.in.push(link); // maybe we'll use it later
                }
            }
        }
    }
}

function draw() {
    background(50);

    if (clicked == false) {
        fill(255, 30);
        noStroke();
        textSize(40);
        text('CLICK to resample', width / 2, (height * 4) / 5);
    }
    for (let link of links) {
        link.show();
    }

    for (let node of nodes) {
        node.visited = false;
        node.show();
        noFill();
        stroke(255, 15);
        ellipse(node.pos.x, node.pos.y, locality * 2);
    }

    localWire();

    stroke(200, 80);
    strokeWeight(3);
    line(0, height - 20, width, height - 20);
    locality = constrain(mouseX, 0, height);
    let progress = locality / (height - 10);
    fill(255 * progress, 255 * (1 - progress), 0);
    noStroke();
    ellipse(locality, height - 20, 10);
    locality = map(locality, 0, height, 0, (height * 2) / 3);

    textSize(22);
    noStroke();
    fill(0, 255, 0);
    text('Local', 35, height - 30);
    fill(255, 0, 0);
    text('Global', width - 40, height - 30);
}

function visit(node) {
    node.visited = true;
    for (let next of node.out) {
        if (next.to.visited == false) {
            visit(next.to);
        }
    }
}

class Node {
    constructor(pos, id) {
        this.pos = pos;
        this.id = id;
        this.out = [];
        this.in = [];
        this.rebalance_speed = 0.04;
        this.visited = false;
    }

    show() {
        stroke(50);
        strokeWeight(1);

        let size = node_diameter;
        fill(0, 65, 225);
        ellipse(this.pos.x, this.pos.y, size, size);
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

    show() {
        stroke(250);
        strokeWeight(1);
        if (this.impulses.length == 0) {
            stroke(255, 30); // default is greyish
        } else {
            stroke(255, 50, 50, 30); // excited is reddish
        }
        strokeWeight(1 + this.impulses.length);
        line(this.from.pos.x, this.from.pos.y, this.to.pos.x, this.to.pos.y);
        /*
        for (let impulse of this.impulses) {
            let tmp = p5.Vector.lerp(this.from.pos, this.to.pos, impulse / this.length);
            noStroke();
            stroke(255, 50, 50);
            ellipse(tmp.x, tmp.y, 5, 5);
        }
        */
    }
}
