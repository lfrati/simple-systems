let num_nodes = 50; // How many nodes
let num_links = 100; // How many links
let nodes = [];
let links = [];
let spread_prob; // Probability of spreading infection
let max_infected = 1000; // Limit number of infected agents to avoid killing my computer
let cur_infected = 0; // How many infected agents are travelling
let buffer = 50; // Leave some space around the network
let ID = 0; // Used to map nodes to rows of the adjacency matrix
let adj; // Adjacency matrix
let node_diameter = 10; // How big should the nodes be?
let slider;
let focused = true;

function mousePressed() {
    for (let node of nodes) {
        let d = dist(mouseX, mouseY, node.pos.x, node.pos.y);
        if (d < 10) {
            node.infect(true);
        }
    }
}

let filter = 0;
let rate = 5; // wheel events are REALLY fast, filter some of them
function mouseWheel(event) {
    //print(event.delta);
    filter = (filter + 1) % rate;
    if (filter == 0) {
        for (let node of nodes) {
            let d = dist(mouseX, mouseY, node.pos.x, node.pos.y);
            if (d < 10) {
                node.infect(true);
            }
        }
    }

    return false; // return false otherwise the page would scroll
}

function addNode(x, y) {
    let pos = createVector(x, y);
    let node = new Node(pos);
    nodes.push(node);
    return node;
}
function connect(from, to) {
    let link = new Link(from, to);
    links.push(link);
    from.out.push(link); // to infect neighbors
    to.in.push(link); // mmmh... maybe we'll use it later
}

function pattern1() {
    let head = addNode(20, 150);
    let halfway = addNode(170, 60);

    connect(
        head,
        halfway
    );

    let tail = addNode(320, 150);
    connect(
        head,
        tail
    );
    connect(
        halfway,
        tail
    );
    let readout = addNode(width - 20, 150);
    connect(
        tail,
        readout
    );

    let p1 = setInterval(() => {
        head.infect(true);
    }, 500);
    return p1;
}

function pattern2() {
    let head = addNode(20, 350);
    let halfway = addNode(170, 350);
    connect(
        head,
        halfway
    );
    let loop1 = addNode(220, 250);
    connect(
        halfway,
        loop1
    );
    let loop2 = addNode(120, 250);
    connect(
        loop1,
        loop2
    );
    connect(
        loop2,
        halfway
    );
    let tail = addNode(320, 350);
    connect(
        halfway,
        tail
    );
    let readout = addNode(width - 20, 350);
    connect(
        tail,
        readout
    );

    let p2 = setInterval(() => {
        head.infect(true);
    }, 500);
    return p2;
}

function setup() {
    let cnv = createCanvas(800, 600);
    cnv.mouseOver(() => {
        focused = true;
    });
    cnv.mouseOut(() => {
        focused = false;
    });

    slider = createSlider(0, 100, 100, 1); // range[0-100] start from 55, increments of 5
    slider.position(100, 5);
    slider.style('width', '100px');
    slider.mouseOver(() => {
        focused = true;
    });
    slider.mouseOut(() => {
        focused = false;
    });
    makePatterns();
}

function makePatterns() {
    nodes = [];
    links = [];
    cur_infected = 0;

    let p1 = pattern1();
    let p2 = pattern2();

    setTimeout(() => {
        clearInterval(p1);
        clearInterval(p2);
    }, 2000);

    setTimeout(makePatterns, 10000);
}

function draw() {
    if (focused) {
        background(50);

        // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
        let fps = frameRate();
        fill(255);
        stroke(0);
        textSize(15);
        text('FPS: ' + fps.toFixed(0), width - 100, 20);

        spread_prob = slider.value() / 100;
        stroke(0);
        strokeWeight(2);
        fill(220, 220, 220);
        textSize(20);
        text('P : ' + nf(spread_prob, 1, 2), 20, 20);
        text('Infected : ' + cur_infected, 210, 20);

        for (let link of links) {
            link.show();
            link.update();
        }

        for (let node of nodes) {
            node.show();
        }
    }
}

class Node {
    constructor(pos) {
        this.pos = pos;
        this.id = ID;
        ID += 1;
        this.out = [];
        this.in = [];
        this.has_been_infected = false;
    }
    // force is used so that clicking bypasses the infection probability
    infect(force) {
        if (force || random() < spread_prob) {
            this.has_been_infected = true;
            for (let edge of this.out) {
                // if we have not reached the max amount of carriers add a new one
                if (cur_infected < max_infected) {
                    edge.infect();
                    cur_infected += 1;
                }
            }
        }
    }

    show() {
        noStroke(); // no border
        if (this.out.length == 0) {
            // not outgoing nodes
            if (this.in.length == 0) {
                // disconnected -> blue
                fill(50, 50, 250);
            } else {
                // dead end -> purple
                fill(160, 50, 250);
            }
        } else {
            if (this.has_been_infected) {
                // a sickening yellow tint
                fill(255, 255, 70);
            } else {
                // a healthy greenish color
                fill(0, 150, 10);
            }
        }
        ellipse(this.pos.x, this.pos.y, node_diameter, node_diameter);
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
    triangle(-distance / 2 - 1, 0, -distance / 2 - height, -base, -distance / 2 - height, +base);
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
        arrowhead(this.from, this.to, 4, 10, node_diameter);

        for (let carrier of this.carriers) {
            let tmp = p5.Vector.lerp(this.from.pos, this.to.pos, carrier / this.length);
            noStroke();
            fill(255);
            ellipse(tmp.x, tmp.y, 5, 5);
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
                cur_infected -= 1;
            }
        }
        this.carriers = new_carriers;
    }
}
