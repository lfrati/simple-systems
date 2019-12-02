let num_nodes = 400; // How many nodes
let spacing = 50;
let buffer = 20; // Leave some space around the network
let node_diameter = 10; // How big should the nodes be?
let locality = 100;
let nonLocal_links = 20;
let num_insertions = 200;

let timeless_network;
let reset_btn, spark_btn, slider;

// Palette
let spikeColor;
let restColor;
let white;
let green;
let red;

let activities = [];

// Interface
let max_signals = 1000; // Limit number of infected agents to avoid killing my computer

function mousePressed() {
  timeless_network.progress = 0;
  for (let node of timeless_network.nodes) {
    let d = dist(mouseX, mouseY, node.pos.x, node.pos.y);
    if (d < 10) {
      timeless_network.nodes[node.id].fire(true, 1);
    }
  }
}

function reset() {
  let time_network = new TimeNetwork(7, 0);
  time_network.makeLattice();
  time_network.probWire();
  timeless_network = new TimelessNetwork(0, time_network);
  cur_signals = 0;
  activities = [];
}

function setup() {
  spikeColor = color(255, 0, 50);
  restColor = color(0, 65, 225);
  let cnv = createCanvas(350, 500);
  white = color(255, 255, 255);
  red = color(255, 0, 0);
  green = color(0, 255, 0);
  reset_btn = createButton("reset");
  reset_btn.mousePressed(() => {
    reset();
  });
  spark_btn = createButton("spark");
  spark_btn.mousePressed(() => {
    for (let node of timeless_network.nodes) {
      node.fire(true, 1);
    }
  });
  slider = createSlider(200, 350, 250, 10);
  slider.input(() => {
    num_insertions = slider.value();
    reset();
  });
  num_insertions = slider.value();

  let time_network = new TimeNetwork(7, 0);
  time_network.makeLattice();
  time_network.probWire();
  timeless_network = new TimelessNetwork(0, time_network);
  frameRate(30);
}

function draw() {
  background(50);

  // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
  // let fps = frameRate();
  // fill(255);
  // stroke(0);
  // textSize(15);
  // text("FPS: " + fps.toFixed(0), width - 100, height - 20);

  // time_network.show();
  timeless_network.show();
  timeless_network.animate();
  timeless_network.update();

  strokeWeight(1);
  noFill();
  stroke(200);
  beginShape();
  for (let idx in activities) {
    vertex(5 + idx * 5, height - activities[idx] * 2 - 50);
  }
  endShape();
  let dy = height - timeless_network.nodes.length * 2 - 50;
  stroke(255, 0, 0, 60);
  line(0, dy, width, dy);
  stroke(0, 255, 0, 60);
  line(0, height - 50, width, height - 50);

  noStroke();
  fill(160);
  textSize(14);
  text("Activity", 8, height - 32);
  textSize(30);
  text(
    "Edges: " + str(timeless_network.links.length),
    width - 175,
    height - 14
  );
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
    this.progress = 0;
    this.dt = 0.04;

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
    this.progress += this.dt;

    for (let link of this.links) {
      link.update(this.progress);
    }

    if (this.progress > 1) {
      this.progress = 0;
      let counter = 0;
      for (let node of this.nodes) {
        if (node.fired) {
          node.fired = false;
          counter += 1;
        }
      }
      if (counter > 0) {
        activities.unshift(counter);
        if (activities.length > width / 2) {
          activities.pop();
        }
      }
    }
    for (let node of this.nodes) {
      node.fire();
      node.update();
    }
  }
  animate() {
    for (let link of this.links) {
      link.animate(this.progress);
    }
    for (let node of this.nodes) {
      node.animate();
    }
  }
  show() {
    for (let link of this.links) {
      link.show(this.progress);
    }
    for (let node of this.nodes) {
      node.show();
    }
  }
}
class TimeNetwork {
  constructor(N, x_offset) {
    this.N = N;
    this.adj = Array(N ** 2)
      .fill()
      .map(() => Array(N ** 2).fill(0));
    this.nodes = [];
    this.links = [];
    this.offset = x_offset;
  }
  makeLattice() {
    let ID = 0;

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
  probWire() {
    this.links = [];

    for (let node of this.nodes) {
      node.out = [];
      node.in = [];
    }
    let side = (this.N - 1) * spacing;
    let max_w = 2 ** 0.5 * side;

    for (let i = 0; i < num_insertions; i++) {
      let from = random(this.nodes);
      let destinations = [];
      for (let node of this.nodes) {
        if (node != from) {
          destinations.push([
            max_w - p5.Vector.dist(node.pos, from.pos),
            node.id
          ]);
        }
      }
      // destinations.sort((firstEl, secondEl) => {
      //     return firstEl[0] > secondEl[0];
      // });

      let tot = destinations.reduce((tot, node) => {
        return tot + node[0];
      }, 0);

      let spin = random() * tot;
      let sampled_node;
      let acc = 0;
      for (let [w, id] of destinations) {
        acc += w;
        if (acc >= spin) {
          sampled_node = id;
          break;
        }
      }
      let to = this.nodes[sampled_node];
      // let to = random(this.nodes);
      if (from != to && this.adj[from.id][to.id] == 0) {
        let link = new Link(from, to);
        from.out.push(link);
        to.in.push(link);
        this.links.push(link);
        this.adj[from.id][to.id] = 1;
      }
    }
  }
}

class TimelessNode {
  constructor(pos, ID) {
    this.pos = pos;
    this.id = ID;
    this.out = [];
    this.in = [];
    this.base_threshold = 4;
    this.activity = 0;
    this.threshold = this.base_threshold;
    this.fired = false;
  }
  // force is used so that clicking bypasses the infection probability
  fire(force) {
    if (force || this.activity > this.threshold) {
      this.activity = 0;
      this.fired = true;
      for (let edge of this.out) {
        // if we have not reached the max amount of carriers add a new one
        edge.fire();
      }
    }
  }
  deliver(payload) {
    this.activity += payload;
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
    fill(255);
    textSize(10);
    text(str(this.id), this.pos.x + 4, this.pos.y);
  }
  animate() {
    noStroke();
    let col = lerpColor(restColor, spikeColor, this.activity / this.threshold);
    if (this.fired) {
      fill("yellow");
    } else {
      // fill(col);
      fill(restColor);
    }
    // if (this.activity > 0) {
    //     ellipse(this.pos.x, this.pos.y, node_diameter + this.activity * 5);
    // } else {
    //     ellipse(this.pos.x, this.pos.y, node_diameter);
    // }
    ellipse(this.pos.x, this.pos.y, node_diameter);
  }
}

class TimelessLink {
  constructor(from, to) {
    this.payload = 0;
    this.from = from;
    this.to = to;
  }
  fire() {
    this.payload += 1;
  }
  animate(progress) {
    if (this.payload > 0) {
      let tmp = p5.Vector.lerp(this.from.pos, this.to.pos, progress);
      noStroke();
      fill(255);
      ellipse(tmp.x, tmp.y, 5 * this.payload);
      // stroke(255, 0, 0, 90);
      // strokeWeight(map(progress, 0, 1, 1, 6));
      // line(
      //     this.from.pos.x,
      //     this.from.pos.y,
      //     this.to.pos.x,
      //     this.to.pos.y,
      // );
    }
  }
  update(progress) {
    if (this.payload > 0) {
      if (progress >= 1) {
        this.to.deliver(this.payload);
        this.payload = 0;
      }
    }
  }
  show(progress) {
    strokeWeight(1);
    // paint link red if there are carriers travelling on it
    if (this.payload > 0) {
      stroke(255, 50, 50); // infected is reddish
    } else {
      stroke(255, 50); // default is greyish
    }

    line(this.from.pos.x, this.from.pos.y, this.to.pos.x, this.to.pos.y);
    arrowhead(this.from, this.to, 2, 6, node_diameter);
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
    +base
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
}

class Node {
  constructor(pos, ID) {
    this.pos = pos;
    this.id = ID;
    this.out = [];
    this.in = [];
    this.threshold = 1;
    this.base_threshold = 4;
    this.activity = 0;
    this.spike_time = 0;
    this.selected = false;
  }
}
