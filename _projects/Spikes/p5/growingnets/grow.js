let num_nodes = 50;
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
let first_run = true;

function ui() {
    let cnv = createCanvas(400, 600);
    cnv.mouseOver(() => {
        focused = true;
    });
    cnv.mouseOut(() => {
        focused = false;
    });

    spikeColor = color(255, 0, 50);
    restColor = color(0, 65, 225);
    plots = createGraphics(width, height);
    plots.clear();
}

function makeNodes() {
    nodes = [];
    cur_impulses = 0;
    adj = Array(num_nodes)
        .fill()
        .map(() => Array(num_nodes).fill(0));

    for (let i = 0; i < num_nodes; i++) {
        let x = buffer + random(width - buffer * 2);
        let y = buffer + random(height - 250);
        let pos = createVector(x, y);
        nodes.push(new Node(pos, ID));
        ID += 1;
    }
}
function setup() {
    ui();
    makeNodes();
    localWire();
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
    }
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
                    //adj[from.id][to.id] = 1;

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
    if (focused || first_run) {
        first_run = false;
        background(50);

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

        if (t < PI) {
            locality = sin(t) * width;
            t += dt;
            localWire();
        } else {
            t = 0;
            num_nodes = 20 + int(random(30));
            makeNodes();
            localWire();
        }
        components = [];
        for (let node of nodes) {
            if (node.visited == false) {
                components.push(node.id);
                visit(node);
            }
        }

        //text(locality, 10, 30);

        let alpha = map(locality, 0, width, 0, 1);
        line(0, height - 10, width, height - 10);
        line(0, height - 60, width, height - 60);
        line(0, height - 110, width, height - 110);
        stroke(200);
        line(alpha * width, height - 10, alpha * width - 1, height - 110);

        if (plot_links.length < PI / dt) {
            let comps = (components.length / num_nodes) * 100;
            plot_links.push([width * alpha - 1, height - 10 - comps]);
        }

        if (plot_comps.length < PI / dt) {
            let linkage = (links.length / (num_nodes * (num_nodes - 1))) * 100;
            plot_comps.push([width * alpha - 1, height - 10 - linkage]);
        }

        fill(120);
        textSize(15);
        noStroke();
        text('          Nodes: ' + str(num_nodes), 10, height - 160);

        noStroke();
        fill(31, 106, 226);
        textSize(15);
        text('Components: ' + components.length + ' / ' + str(num_nodes), 10, height - 120);

        strokeWeight(2);
        stroke(31, 106, 226);
        noFill();
        beginShape();
        for (let point of plot_links) {
            vertex(point[0], point[1]);
        }
        endShape();

        fill(15, 198, 25);
        noStroke();
        textSize(15);
        text(
            '            Links: ' + links.length + ' / ' + str(num_nodes * (num_nodes - 1)),
            10,
            height - 140
        );

        strokeWeight(2);
        stroke(15, 198, 25);
        noFill();
        beginShape();
        for (let point of plot_comps) {
            vertex(point[0], point[1]);
        }
        endShape();

        /*
        plots.noStroke();
        //plots.fill(255, 0, 0);
        //plots.ellipse(width * alpha, height - 10, 7);
        plots.fill(0, 255, 0);
        plots.ellipse(width * alpha, height - 10 - comps, 6);
        plots.fill(0, 100, 255);
        plots.ellipse(width * alpha, height - 10 - linkage, 5);
*/
        image(plots, 0, 0);
    }
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
