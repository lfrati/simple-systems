let nodes = [];
let quad;
let capacity = 5;
let connDist = 200;
let mouseConnDist = connDist;
let ID = 0;
let Adj;
let buffer = connDist / 2;

function populate() {
    let boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
    quad = new QuadTree(boundary, capacity);

    nodes = [];
    let num_nodes = (3 * width * height) / (connDist * connDist);
    //console.log(width, height, num_nodes);
    for (let i = 0; i < num_nodes; i++) {
        let node = new Node(ID);
        ID += 1;
        nodes.push(node);
        let point = new Point(node.pos.x, node.pos.y, node);
        quad.insert(point);
    }

    Adj = Array(ID)
        .fill()
        .map(() => Array(ID).fill(0));
}

function setup() {
    let canvas = createCanvas(windowWidth + buffer, windowHeight + buffer);

    canvas.style('left: ' + -buffer / 2 + 'px; top: ' + -buffer / 2 + 'px;');
    canvas.addClass('background');

    populate();
}

function connectMouse() {
    let pos = createVector(mouseX, mouseY);
    let range = new Circle(pos.x, pos.y, mouseConnDist);
    let points = quad.query(range);

    if (points.length > 3) {
        for (let point of points) {
            let other = point.data;
            let d = pos.dist(other.pos);
            let alpha = (mouseConnDist - d) / mouseConnDist;
            if (other != this) {
                stroke(0, 100 * alpha);
                line(pos.x, pos.y, other.pos.x, other.pos.y);
            }
        }
    }
}

function draw() {
    background(255);
    for (let node of nodes) {
        node.show(nodes);
    }
    connectMouse();
    //quad.displayQuads()
    quad.clear();
    Adj = Array(ID)
        .fill()
        .map(() => Array(ID).fill(0));
    for (let node of nodes) {
        node.update();
        let point = new Point(node.pos.x, node.pos.y, node);
        quad.insert(point);
    }
}

Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
};

class Node {
    constructor(ID) {
        this.id = ID;
        this.pos = createVector(random() * width, random() * height);
        this.speed = p5.Vector.random2D();
        this.speed.setMag(0.5 + random(0.5));
    }

    show() {
        noStroke();
        fill(220);
        ellipse(this.pos.x, this.pos.y, 2);
        strokeWeight(1.5);

        let range = new Circle(this.pos.x, this.pos.y, connDist);
        let points = quad.query(range);

        if (points.length > 3) {
            for (let point of points) {
                let other = point.data;
                if (Adj[this.id][other.id] == 0) {
                    let d = this.pos.dist(other.pos);
                    let alpha = (connDist - d) / connDist;
                    if (other != this) {
                        Adj[this.id][other.id] = Adj[other.id][this.id] = 1;
                        stroke(0, 100 * alpha);
                        line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
                    }
                }
            }
        }
    }

    update() {
        this.pos.x = (this.pos.x + this.speed.x).mod(width);
        this.pos.y = (this.pos.y + this.speed.y).mod(height);
    }
}
