let num_nodes = 400; // How many nodes
let spacing = 50;
let nodes = [];
let links = [];
let spread_prob; // Probability of spreading infection
let buffer = 20; // Leave some space around the network
let ID = 0; // Used to map nodes to rows of the adjacency matrix
let adj; // Adjacency matrix
let node_diameter = 10; // How big should the nodes be?
let focused = true;
let locality = 100;
let nonLocal_links = 20;
let window_size = 1000;
let attraction = 1;
let repulsion = 1;

let time_network, timeless_network;
let reset;

// Palette
let spikeColor;
let restColor;
let white;
let green;
let red;

// Interface
let slider;
let max_signals = 1000; // Limit number of infected agents to avoid killing my computer
let cur_signals = 0; // How many infected agents are travelling
let timeless_signals = 0;

function mousePressed() {
    for (let node of time_network.nodes) {
        let d = dist(mouseX, mouseY, node.pos.x, node.pos.y);
        if (d < 10) {
            node.infect(true);
            timeless_network.nodes[node.id].infect(true);
        }
    }
}

function setup() {
    spikeColor = color(255, 0, 50);
    restColor = color(0, 65, 225);
    let cnv = createCanvas(750, 400);
    time_network = new TimeNetwork(7, 0);
    time_network.makeLattice();
    time_network.localWire();
    time_network.nonLocalWire();
    timeless_network = new TimelessNetwork(400, time_network);
    white = color(255, 255, 255);
    red = color(255, 0, 0);
    green = color(0, 255, 0);
    reset = createButton('reset');
    reset.mousePressed(() => {
        time_network = new TimeNetwork(7, 0);
        time_network.makeLattice();
        time_network.localWire();
        time_network.nonLocalWire();
        timeless_network = new TimelessNetwork(400, time_network);
        cur_signals = 0;
    });
    // reset.position(width, height - 5);
}

function draw() {
    background(50);

    // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
    // let fps = frameRate();
    // fill(255);
    // stroke(0);
    // textSize(15);
    // text('FPS: ' + fps.toFixed(0), width - 100, height - 20);

    time_network.show();
    time_network.animate();
    if (cur_signals < max_signals) {
        time_network.update();
    }
    timeless_network.show();
    timeless_network.animate();
    timeless_network.update();

    // Sketch labels
    fill('grey');
    textSize(40);
    text('TIME-ly', 20, height - 20);
    text('TIME-less', width - 220, height - 20);

    for (let node of time_network.nodes) {
        let d = dist(mouseX, mouseY, node.pos.x, node.pos.y);
        if (d < 10) {
            node.selected = true;
            timeless_network.nodes[node.id].selected = true;
        } else {
            node.selected = false;
            timeless_network.nodes[node.id].selected = false;
        }
    }
    fill(255);
    rect(width / 2 - 25, height, 40, -height - 2);

    textSize(map(cur_signals / max_signals, 0, 1, 10, 32));
    let col = lerpColor(white, red, cur_signals / max_signals);
    fill(col);
    textAlign(RIGHT);
    text(str(cur_signals), 330, height - 20);

    let timeless_signals = 0;
    for (let link of timeless_network.links) {
        if (link.signalling) {
            timeless_signals += 1;
        }
    }
    let timeless_progress = timeless_signals / timeless_network.links.length;
    textSize(map(timeless_progress, 0, 1, 10, 32));
    fill(lerpColor(white, green, timeless_progress));

    textAlign(LEFT);
    text(str(timeless_signals), 410, height - 20);
}
class TimelessNetwork {
    constructor(x_offset, time_network) {
        this.N = time_network.N;
        this.adj = Array(this.N)
            .fill()
            .map(() => Array(this.N).fill(0));
        this.nodes = [];
        this.links = [];
        this.offset = x_offset;

        for (let node of time_network.nodes) {
            let pos = node.pos.copy();
            pos.x = pos.x + this.offset;
            this.nodes.push(new TimelessNode(pos, node.id));
        }
        for (let link of time_network.links) {
            let from_id = link.from.id;
            let to_id = link.to.id;
            let from_node = this.nodes[from_id];
            let to_node = this.nodes[to_id];
            let new_link = new TimelessLink(from_node, to_node);
            new_link.from.out.push(new_link);
            new_link.to.in.push(new_link);
            this.links.push(new_link);
        }
    }
    update() {
        for (let node of this.nodes) {
            node.update();
        }

        for (let link of this.links) {
            link.update();
        }
    }
    animate() {
        for (let link of this.links) {
            link.animate();
        }
        for (let node of this.nodes) {
            node.animate();
        }
    }
    show() {
        for (let link of this.links) {
            link.show();
        }
        for (let node of this.nodes) {
            node.show();
        }
    }
}

class TimeNetwork {
    constructor(N, x_offset) {
        this.N = N;
        this.adj = Array(N)
            .fill()
            .map(() => Array(N).fill(0));
        this.nodes = [];
        this.links = [];
        this.offset = x_offset;
    }
    update() {
        for (let node of this.nodes) {
            node.update();
        }

        for (let link of this.links) {
            link.update();
        }
    }
    animate() {
        for (let link of this.links) {
            link.animate();
        }
        for (let node of this.nodes) {
            node.animate();
        }
    }
    show() {
        for (let link of this.links) {
            link.show();
        }
        for (let node of this.nodes) {
            node.show();
        }
    }
    makeLattice() {
        nodes = [];
        ID = 0;

        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                let x = buffer + i * spacing;
                let y = buffer + j * spacing;
                let pos = createVector(x, y);
                this.nodes.push(new Node(pos, ID));
                ID += 1;
            }
        }
    }

    localWire() {
        links = [];

        for (let node of this.nodes) {
            node.out = [];
            node.in = [];
        }

        let link_pairs = [];
        for (let from of this.nodes) {
            for (let to of this.nodes) {
                if (from.id < to.id) {
                    let d = dist(from.pos.x, from.pos.y, to.pos.x, to.pos.y);
                    if (d < locality) {
                        let link = new Link(from, to);
                        link_pairs.push(link); // to iterate over them
                        link = new Link(to, from);
                        link_pairs.push(link); // to iterate over them
                    }
                }
            }
        }
        links = [];
        for (let i = 0; i < link_pairs.length; i += 2) {
            let link;
            if (random() < 0.5) {
                link = link_pairs[i];
            } else {
                link = link_pairs[i + 1];
            }
            link.from.out.push(link);
            link.to.in.push(link);
            this.links.push(link);
        }
    }

    nonLocalWire() {
        for (let i = 0; i < nonLocal_links; i++) {
            let from = random(this.nodes);
            let to = random(this.nodes);
            let link = new Link(from, to);
            link.from.out.push(link);
            link.to.in.push(link);
            this.links.push(link);
        }
    }
}

class Node {
    constructor(pos, ID) {
        this.pos = pos;
        this.id = ID;
        this.out = [];
        this.in = [];
        this.has_been_infected = false;
        this.threshold = 1;
        this.base_threshold = 4;
        this.activity = 0;
        this.spike_time = 0;
        this.selected = false;
    }
    // force is used so that clicking bypasses the infection probability
    infect(force) {
        this.activity += 1;
        if (force || this.activity > this.threshold) {
            this.spike_time = new Date().getTime();
            this.activity = -this.threshold;
            for (let edge of this.out) {
                // if we have not reached the max amount of carriers add a new one
                edge.infect();
                cur_signals += 1;
            }
        }
    }

    update() {
        if (this.threshold > this.base_threshold) {
            this.threshold -= 0.1;
        }
        if (this.activity > 0) {
            this.activity -= 0.005;
        }
    }

    show() {
        noStroke(); // no border
        fill(restColor);
        ellipse(this.pos.x, this.pos.y, node_diameter, node_diameter);
    }
    animate() {
        noStroke();
        if (this.activity > 0) {
            let col = lerpColor(
                restColor,
                spikeColor,
                this.activity / this.threshold,
            );
            if (this.selected) {
                fill('yellow');
            } else {
                fill(col);
            }
            ellipse(this.pos.x, this.pos.y, node_diameter + this.activity * 5);
        } else {
            if (this.selected) {
                fill('yellow');
            } else {
                fill(restColor);
            }
            ellipse(this.pos.x, this.pos.y, node_diameter);
        }
        noFill();
        stroke(100);
        strokeWeight(1);
    }
}

class TimelessNode extends Node {
    constructor(pos, ID) {
        super(pos, ID);
    }
    // force is used so that clicking bypasses the infection probability
    infect(force) {
        this.activity += 1;
        if (force || this.activity > this.threshold) {
            this.activity = -this.threshold;
            for (let edge of this.out) {
                // if we have not reached the max amount of carriers add a new one
                edge.infect();
                // cur_signals += 1;
            }
        }
    }
}

// to show the direction of the link, require some calculation but it's worth it.
function arrowhead(from, to, base, height, distance) {
    let rot = p5.Vector.sub(to.pos, from.pos).heading(); // get angle of the link
    push();
    translate(to.pos.x, to.pos.y); // move the origin to the target the arrow is pointing to
    rotate(rot); // rotate to align the tip
    noStroke(); // strong independent arrows need no border
    fill(255, 50); // a bit of transparency, we want to see them if they overlap
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

class Link {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.carriers = [];
        this.dt = 3; // step length along the link, longer = faster
        this.length = p5.Vector.dist(this.from.pos, this.to.pos);
    }

    infect() {
        this.carriers.push(0);
    }

    show() {
        strokeWeight(1);
        // paint link red if there are carriers travelling on it
        if (this.carriers.length == 0) {
            stroke(255, 50); // default is greyish
        } else {
            stroke(255, 50, 50); // infected is reddish
        }

        line(this.from.pos.x, this.from.pos.y, this.to.pos.x, this.to.pos.y);
        arrowhead(this.from, this.to, 2, 6, node_diameter);
    }

    animate() {
        for (let carrier of this.carriers) {
            let tmp = p5.Vector.lerp(
                this.from.pos,
                this.to.pos,
                carrier / this.length,
            );
            noStroke();
            fill(255);
            ellipse(tmp.x, tmp.y, 5, 5);
            // noFill();
            // stroke(0, 30);
            // ellipse(this.from.pos.x, this.from.pos.y, carrier * 2, carrier * 2);
        }
    }

    update() {
        let new_carriers = [];

        for (let carrier of this.carriers) {
            // move
            let new_traveler = carrier + this.dt;
            if (new_traveler < this.length) {
                new_carriers.push(new_traveler);
            } else {
                // destination reached
                this.to.infect(false);
                cur_signals -= 1;
            }
        }
        this.carriers = new_carriers;
    }
}

class TimelessLink extends Link {
    constructor(from, to) {
        super(from, to);
        this.progress = 0;
        this.dt = 0.05;
        this.payload = 0;
        this.signalling = false;
    }
    infect() {
        if (this.signalling == false) {
            this.signalling = true;
            this.progress = 0;
            this.payload = 1;
        } else {
            this.payload += 2;
        }
    }
    animate() {
        if (this.signalling) {
            let tmp = p5.Vector.lerp(this.from.pos, this.to.pos, this.progress);
            noStroke();
            fill(255);
            ellipse(tmp.x, tmp.y, 5 * this.payload, 5 * this.payload);
        }
    }
    update() {
        if (this.signalling) {
            this.progress += this.dt;
            if (this.progress >= 1) {
                this.to.infect(false);
                this.signalling = false;
                this.progress = 0;
                this.payload = 0;
            }
        }
    }
    show() {
        strokeWeight(1);
        // paint link red if there are carriers travelling on it
        if (!this.signalling) {
            stroke(255, 50); // default is greyish
        } else {
            stroke(255, 50, 50); // infected is reddish
        }

        line(this.from.pos.x, this.from.pos.y, this.to.pos.x, this.to.pos.y);
        arrowhead(this.from, this.to, 2, 6, node_diameter);
    }
}
