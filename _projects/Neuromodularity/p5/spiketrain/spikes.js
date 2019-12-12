let num_nodes = 50;
let num_links = 800;
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
let buffer = 70;

let locality = 200;
let locality_slider;
let focused = false;
let first_run = true;
let reset;

function mousePressed() {
  for (let node of nodes) {
    let d = dist(mouseX, mouseY, node.pos.x, node.pos.y);
    if (d < 10) {
      node.excite(true);
    }
  }
}

let trigger = 0;
let rate = 5;
function mouseWheel(event) {
  //print(event.delta);
  trigger = (trigger + 1) % rate;
  if (trigger == 0) {
    for (let node of nodes) {
      let d = dist(mouseX, mouseY, node.pos.x, node.pos.y);
      if (d < 10) {
        node.excite(true);
      }
    }
  }

  return false;
}

function ui() {
  let cnv = createCanvas(700, 500);
  cnv.mouseOver(() => {
    focused = true;
  });
  cnv.mouseOut(() => {
    focused = false;
  });

  slider = createSlider(0, 10, 0, 1);
  slider.position(100, 5);
  slider.style("width", "80px");
  slider.mouseOver(() => {
    focused = true;
  });
  slider.mouseOut(() => {
    focused = false;
  });

  locality_slider = createSlider(10, locality * 2, locality, 10);
  locality_slider.position(100, 30);
  locality_slider.style("width", "80px");
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

  reset = createButton("reset");
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
}

function draw() {
  if (focused || first_run) {
    first_run = false;
    background(50);
    //fill(255);
    //ellipse(mouseX, mouseY, 200, 200);
    // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
    // let fps = frameRate();
    // fill(255);
    // stroke(0);
    // textSize(15);
    // text('FPS: ' + fps.toFixed(0), width - 100, 20);

    textSize(20);
    stroke(0);
    strokeWeight(2);
    fill(220, 220, 220);
    inhibition = slider.value();
    locality = locality_slider.value();
    text("I : " + inhibition, 20, 20);
    text("r : " + locality, 20, 50);
    text("impulses : " + cur_impulses, 200, 20);

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
      this.activation += 1;
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
      this.activation -= this.rebalance_speed * 2;
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

    let size = node_diameter + this.activation * 2;
    if (size >= 0) {
      fill(
        lerpColor(
          restColor,
          spikeColor,
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
      node_diameter + (this.threshold + this.dampening + inhibition) * 2,
      node_diameter + (this.threshold + this.dampening + inhibition) * 2
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
