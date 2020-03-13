// @format
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
let slider_y, slider_x;
let focused = true;
let movable_node, movable_node_x, movable_node_y;

let filter = 0;

function addNode(x, y) {
  let pos = createVector(x, y);
  let node = new Node(pos);
  nodes.push(node);
  return node;
}
function connect(from, to, col) {
  let link = new Link(from, to);
  if (col != undefined) {
    link.col = col;
  }
  links.push(link);
  from.out.push(link); // to infect neighbors
  to.in.push(link); // mmmh... maybe we'll use it later
}

function pattern1() {
  let head = addNode(20, 160);
  head.color = "red";
  let halfway = addNode(170, 40);

  connect(head, halfway, "yellow");

  let tail = addNode(320, 160);
  connect(head, tail);
  connect(halfway, tail);
  let readout = addNode(width - 20, 160);
  connect(tail, readout);
  readout.color = "grey";

  let p1 = setInterval(() => {
    head.infect(true);
  }, 300);
  return p1;
}

function pattern2() {
  let head = addNode(20, 360);
  head.color = "red";
  let halfway = addNode(170, 360);
  connect(head, halfway);
  let loop1 = addNode(230, 260);
  connect(halfway, loop1, "yellow");
  let loop2 = addNode(110, 260);
  connect(loop1, loop2);
  connect(loop2, halfway);
  let readout = addNode(width - 20, 360);
  connect(halfway, readout);
  readout.color = "grey";

  let p2 = setInterval(() => {
    head.infect(true);
  }, 300);
  return p2;
}

function pattern3() {
  let head = addNode(20, 530);
  head.color = "red";
  let halfway = addNode(170, 610);

  let loop1 = addNode(220, 690);
  connect(halfway, loop1, "violet");
  connect(head, halfway, "yellow");

  let loop2 = addNode(120, 690);
  connect(loop1, loop2);
  connect(loop2, halfway);

  let loop4 = addNode(170, 530);
  movable_node = loop4;
  movable_node.color = "white";
  movable_node_x = loop4.pos.x;
  movable_node_y = loop4.pos.y;

  let loop5 = addNode(250, 460);
  let loop6 = addNode(100, 460);
  connect(loop4, loop5, "blue");
  connect(loop5, loop6);
  connect(loop6, loop4);
  connect(head, loop4);

  let tail = addNode(320, 530);
  connect(halfway, tail);
  connect(loop4, tail);

  let readout = addNode(width - 20, 530);
  connect(tail, readout);
  readout.color = "grey";

  let p3 = setInterval(() => {
    head.infect(true);
  }, 300);
  return p3;
}

let uncovered = true;
function setup() {
  let cnv = createCanvas(900, 740);

  cnv.mouseMoved(() => {
    if (mouseX < width && mouseX > 300 && mouseY > 0 && mouseY < height) {
      uncovered = true;
    } else {
      uncovered = false;
    }
  });

  cnv.mouseClicked(() => {
    makePatterns();
  });

  slider_y = createSlider(-150, 150, 0, 10); // range[0-100] start from 55, increments of 5
  slider_x = createSlider(-150, 150, 0, 10); // range[0-100] start from 55, increments of 5
  slider_y.position(190, 610);
  slider_y.style("width", "100px");
  slider_x.position(20, 610);
  slider_x.style("width", "100px");
  slider_x.style("rotate", "90");
  makePatterns();
  frameRate(30);
}

function makePatterns() {
  nodes = [];
  links = [];
  cur_infected = 0;

  let p1 = pattern1();
  let p2 = pattern2();
  let p3 = pattern3();

  setTimeout(() => {
    clearInterval(p1);
    clearInterval(p2);
    clearInterval(p3);
  }, 1000);

  // setTimeout(makePatterns, 10000);
}

function round10(x) {
  return Math.ceil(x / 10) * 10;
}

function draw() {
  background(50);

  // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
  let fps = frameRate();
  fill(255);
  stroke(0);
  textSize(15);
  text("FPS: " + round10(fps), width - 100, 20);

  movable_node.pos.x = movable_node_x + slider_y.value();
  movable_node.pos.y = movable_node_y + slider_x.value();

  for (let link of links) {
    link.show();
    link.update();
  }

  for (let node of nodes) {
    node.show();
  }

  if (uncovered) {
    fill(20);
    strokeWeight(2);
    stroke(0);
    rect(30, 30, 275, height - 60);
    fill(200);
    textSize(40);
    text("? ? ?", 120, height / 2);
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
    this.color = "green";
  }
  // force is used so that clicking bypasses the infection probability
  infect(force, col) {
    for (let edge of this.out) {
      // if we have not reached the max amount of carriers add a new one
      if (cur_infected < max_infected) {
        if (force) {
          edge.infect("red");
        } else {
          edge.infect(col);
        }
        cur_infected += 1;
      }
    }
  }

  show() {
    noStroke(); // no border
    fill(this.color);
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
    this.col = undefined;
  }

  infect(col) {
    if (this.col == undefined) {
      this.carriers.push([col, 0]);
    } else {
      this.carriers.push([this.col, 0]);
    }
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
    for (let [col, progress] of this.carriers) {
      let tmp = p5.Vector.lerp(this.from.pos, this.to.pos, progress / p5.Vector.dist(this.from.pos, this.to.pos));
      noStroke();
      fill(col);
      ellipse(tmp.x, tmp.y, 7, 7);
    }
  }

  update() {
    let new_carriers = [];

    for (let [col, progress] of this.carriers) {
      // move
      let new_progress = progress + this.dt;
      if (new_progress < p5.Vector.dist(this.from.pos, this.to.pos)) {
        new_carriers.push([col, new_progress]);
      } else {
        // destination reached
        this.to.infect(false, col);
        cur_infected -= 1;
      }
    }
    this.carriers = new_carriers;
  }
}
