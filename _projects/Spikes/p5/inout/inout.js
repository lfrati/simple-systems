let num_nodes = 200;
let num_links = 800;
let nodes = [];
let links = [];
let readIn = [];
let readOut = [];

let readNodes = 5;
let readSize = 5;
let readSpacing = 80;
let buffer = 70;
let node_diameter = 10;
let locality = 200;
let ID = 0;

let inhibition;
let cur_impulses;
let adj;
let slider;
let spikeColor;
let restColor;
let locality_slider;
let focused = false;
let first_run = true;
let reset;
let fire;
let seed;

let trigger = 0;
let rate = 5;

function setup() {
    seed = int(random(10000));
    randomSeed(seed);
    ui();
    makeNodes();
    localWire();
}

function ui() {
    let cnv = createCanvas(700, 600);
    cnv.mouseOver(() => {
        focused = true;
    });
    cnv.mouseOut(() => {
        focused = false;
    });

    cnv.mousePressed(() => {
        for (let pin of readIn) {
            let d = dist(mouseX, mouseY, pin.pos.x, pin.pos.y);
            if (d < 10) {
                pin.active = !pin.active;
            }
        }
    });

    slider = createSlider(0, 10, 0, 1);
    slider.position(100, 5);
    slider.style('width', '80px');
    slider.mouseOver(() => {
        focused = true;
    });
    slider.mouseOut(() => {
        focused = false;
    });

    locality_slider = createSlider(10, locality * 2, locality, 10);
    locality_slider.position(100, 30);
    locality_slider.style('width', '80px');
    locality_slider.mouseOver(() => {
        focused = true;
    });
    locality_slider.mouseOut(() => {
        focused = false;
    });
    locality_slider.mouseMoved(() => {
        if (mouseIsPressed) {
            locality = locality_slider.value();
            cur_impulses = 0;
            for (let node of nodes) {
                node.dampening = 0;
            }
            localWire();
        }
    });

    reset = createButton('reset');
    reset.position(200, 30);
    reset.mousePressed(() => {
        makeNodes();
        localWire();
    });
    reset.mouseOver(() => {
        focused = true;
    });
    reset.mouseOut(() => {
        focused = false;
    });

    spikeColor = color(255, 0, 50);
    restColor = color(0, 65, 225);

    for (let i = 0; i < readNodes; i++) {
        let x_in = 15;
        let y_in = height / 2 + (i - readNodes / 2) * readSpacing;
        let x_out = width - 35;
        let y_out = height / 2 + (i - readNodes / 2) * readSpacing;

        let posIn = createVector(x_in, y_in);
        let posOut = createVector(x_out, y_out);

        let nodeOut = new Node(posOut, 0);
        let nodeIn = new Pin(posIn, nodeOut);
        nodeOut.pair = nodeIn;
        nodeOut.restColor = color(80, 200, 80);

        readIn.push(nodeIn);
        readOut.push(nodeOut);
    }
    fire = createButton('FIRE');
    fire.position(2, height / 2 + (readSpacing * readNodes) / 2);
    fire.mousePressed(() => {
        for (let pin of readIn) {
            pin.excite();
        }
    });
    fire.mouseOver(() => {
        focused = true;
    });
    fire.mouseOut(() => {
        focused = false;
    });
}

function makeNodes() {
    nodes = [];
    cur_impulses = 0;
    adj = Array(num_nodes)
        .fill()
        .map(() => Array(num_nodes).fill(0));

    for (let i = 0; i < num_nodes; i++) {
        let x = buffer + random(width - buffer * 2);
        let y = buffer + random(height - buffer * 2);
        let pos = createVector(x, y);
        nodes.push(new Node(pos, ID));
        ID += 1;
    }
}

function randomWire() {
    links = [];

    for (let node of nodes) {
        node.out = [];
        node.in = [];
    }

    for (let i = 0; i < num_links; i++) {
        let from = random(nodes);
        let to = random(nodes);
        let duplicate = adj[from.id][to.id] == 1;

        // avoid loops
        while (from == to || duplicate) {
            to = random(nodes);
            duplicate = adj[from.id][to.id] == 1;
        }

        adj[from.id][to.id] = 1;

        let link = new Link(from, to);
        links.push(link); // to iterate over them
        from.out.push(link); // to excite neighbors
        to.in.push(link); // maybe we'll use it later

        // UNDIRECTED GRAPH, beware of link count

        //adj[to.id][from.id] = 1;
        //link = new Link(to, from);
        //links.push(link);
        //from.in.push(link);
        //to.out.push(link);
    }
}

function localWire() {
    links = [];

    for (let node of nodes) {
        node.out = [];
        node.in = [];
    }

    for (let from of nodes) {
        from.out = [];
        for (let to of nodes) {
            if (to != from) {
                let d = dist(from.pos.x, from.pos.y, to.pos.x, to.pos.y);
                if (d < locality) {
                    //adj[from.id][to.id] = 1;

                    let link = new Link(from, to);
                    links.push(link); // to iterate over them
                    from.out.push(link); // to excite neighbors
                    to.in.push(link); // maybe we'll use it later
                }
            }
        }
    }
    attachReadInOut();
}

function attachReadInOut() {
    for (let from of readIn) {
        let r = 0;
        from.out = [];
        while (from.out.length < readSize) {
            let candidates = [];
            for (let to of nodes) {
                if (to != from) {
                    let d = dist(from.pos.x, from.pos.y, to.pos.x, to.pos.y);
                    if (d < r) {
                        candidates.push(to);
                    }
                }
            }
            if (candidates.length > readSize) {
                for (let to of candidates) {
                    let link = new Link(from, to);
                    links.push(link); // to iterate over them
                    from.out.push(link); // to excite neighbors
                }
            } else {
                r += 1;
            }
        }
    }
    for (let to of readOut) {
        let r = 0;
        to.in = [];
        while (to.in.length < readSize) {
            let candidates = [];
            for (let from of nodes) {
                if (to != from) {
                    let d = dist(from.pos.x, from.pos.y, to.pos.x, to.pos.y);
                    if (d < r) {
                        candidates.push(from);
                    }
                }
            }
            if (candidates.length > readSize) {
                for (let from of candidates) {
                    let link = new Link(from, to);
                    links.push(link); // to iterate over them
                    from.out.push(link); // to excite neighbors
                    to.in.push(link);
                }
            } else {
                r += 1;
            }
        }
    }
}

function draw() {
    if (focused || first_run) {
        first_run = false;
        background(50);
        // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
        let fps = frameRate();
        fill(255);
        stroke(0);
        textSize(15);
        text('FPS: ' + fps.toFixed(0), width - 100, 20);
        text('seed: ' + seed, width - 100, 40);

        textSize(20);
        stroke(0);
        strokeWeight(2);
        fill(220, 220, 220);
        inhibition = slider.value();
        locality = locality_slider.value();
        text('I : ' + inhibition, 20, 20);
        text('r : ' + locality, 20, 50);
        text('impulses : ' + cur_impulses, 200, 20);

        fill(255);
        stroke(255);

        for (let link of links) {
            link.show();
            link.update();
        }

        for (let node of nodes) {
            node.show();
            node.update();
        }

        for (let node of readIn) {
            node.show();
        }

        for (let node of readOut) {
            node.show();
            node.update();
        }
    }

    // SPIKE TRAIN START ----------------------------
    /*fill(255);

    for (let node of nodes) {
        if (node.excited) {
            spike_train[node.id].unshift(1);
            spike_train[node.id].pop();
        } else {
            spike_train[node.id].unshift(0);
            spike_train[node.id].pop();
        }
        node.excited = false;
    }

    for (let node in nodes) {
        let spacing = 4; // 10
        stroke(255, 50);
        strokeWeight(1);
        line(20, height - 300 + node * spacing, 20 + max_train * 4, height - 300 + node * spacing);

        for (let t in spike_train[node]) {
            if (spike_train[node][t] == 1) {
                ellipse(20 + t * 4, height - 300 + node * spacing, spacing, spacing);
            }
        }
    }*/
    // SPIKE TRAIN END ----------------------------
}

class Pin {
    constructor(pos, pair) {
        this.pos = pos;
        this.out = [];
        this.in = [];
        this.active = true;
        this.pair = pair;
    }
    excite() {
        if (this.active) {
            for (let out of this.out) {
                out.excite();
                cur_impulses += 1;
            }
        }
    }
    show() {
        stroke(120);
        strokeWeight(1);

        if (this.active) {
            fill(255);
        } else {
            fill(0);
        }
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, node_diameter * 2, node_diameter * 2);
    }
}

class Node {
    constructor(pos, id) {
        this.pos = pos;
        this.id = id;
        this.out = [];
        this.in = [];
        this.excited = false; // used to draw the spike train
        this.activation = 0;
        this.threshold = 5;
        this.dampening = 0;
        this.rebalance_speed = 0.04;
        this.restColor = restColor;
        this.spikeColor = spikeColor;
    }
    excite(force) {
        if (force) {
            // force it to send impulses on click
            for (let edge of this.out) {
                edge.excite();
                cur_impulses += 1;
            }
        } else {
            // normal excite from another neuron
            this.activation += 0.5;
        }
    }

    update() {
        if (this.activation > this.threshold + this.dampening + inhibition) {
            this.excited = true;
            this.activation = 0;
            this.dampening += 2;
            for (let edge of this.out) {
                edge.excite();
                cur_impulses += 1;
            }
        }

        if (this.activation > 0) {
            this.activation -= this.rebalance_speed / 40;
        }

        if (this.activation < 0) {
            this.activation = 0;
        }

        if (this.dampening > 0) {
            this.dampening -= this.rebalance_speed / 2; // slow dampening recover to let the acitivity die out
        }
    }

    show() {
        stroke(50);
        strokeWeight(1);

        let size = node_diameter + this.activation;
        if (size >= 0) {
            fill(
                lerpColor(
                    this.restColor,
                    this.spikeColor,
                    this.activation / (this.threshold + this.dampening + inhibition)
                )
            );
            ellipse(this.pos.x, this.pos.y, size, size);
        }
        noFill();
        stroke(255, 50);
        ellipse(
            this.pos.x,
            this.pos.y,
            node_diameter + (this.threshold + this.dampening + inhibition),
            node_diameter + (this.threshold + this.dampening + inhibition)
        );
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

    update() {
        let new_travelers = [];

        for (let impulse of this.impulses) {
            let new_traveler = impulse + this.speed;
            if (new_traveler < this.length) {
                new_travelers.push(new_traveler);
            } else {
                // destination reached
                this.to.excite(false);
                cur_impulses -= 1;
            }
        }
        this.impulses = new_travelers;
    }
}
