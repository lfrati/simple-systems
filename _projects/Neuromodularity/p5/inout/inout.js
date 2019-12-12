let num_nodes = 50;
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
let waves = [];
for (let i = 0; i < readNodes; i++) {
  waves[i] = [];
}

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
let plot;
let trainSize = 35;

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

  for (let i = 0; i < readNodes; i++) {
    let x_in = 35;
    let y_in = height / 2 + (i - readNodes / 2) * readSpacing;
    let x_out = width - 35;
    let y_out = height / 2 + (i - readNodes / 2) * readSpacing;

    let posIn = createVector(x_in, y_in);
    let posOut = createVector(x_out, y_out);

    let nodeOut = new ReadNode(posOut, 0);
    let nodeIn = new Pin(posIn, nodeOut);
    nodeOut.pair = nodeIn;
    nodeOut.restColor = nodeOut.color = color(80, 200, 80);
    readIn.push(nodeIn);
    readOut.push(nodeOut);
  }
  fire = createButton("FIRE");
  fire.position(5, height / 2 + (readSpacing * readNodes) / 3 + 3);
  fire.style("color", "red");
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

  plot = createGraphics(width, trainSize * readNodes + 2);
  plot.clear();
}

function makeNodes() {
  nodes = [];
  cur_impulses = 0;
  adj = Array(num_nodes)
    .fill()
    .map(() => Array(num_nodes).fill(0));
  ID = 0;

  for (let i = 0; i < num_nodes; i++) {
    let x = map(random(), 0, 1, 80, width - 80);
    let y = map(random(), 0, 1, 80, height - 200);
    let pos = createVector(x, y);
    nodes.push(new Node(pos, ID));
    ID += 1;
  }
  for (let node of readOut) {
    node.activation = 0;
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
        if (d < locality && adj[to.id][from.id] != 1) {
          let link = new Link(from, to);
          links.push(link); // to iterate over them
          from.out.push(link); // to excite neighbors
          to.in.push(link); // maybe we'll use it later
          // adj[from.id][to.id] = 1; // uncomment to make the graph directed
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
    // let fps = frameRate();
    // fill(255);
    // stroke(0);
    // textSize(15);
    // text('FPS: ' + fps.toFixed(0), width - 100, 20);
    // text('seed: ' + seed, width - 100, 40);

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

    plotActivity();
    image(plot, 0, height - 180);

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
}

function plotActivity() {
  plot.background(20);
  for (let i in readOut) {
    i = int(i);
    let subject = readOut[i];
    waves[i].unshift(
      subject.activation / (subject.threshold + subject.dampening + inhibition)
    );

    // axis
    plot.stroke(255, 50);
    plot.strokeWeight(0.5);
    plot.line(0, trainSize * (i + 1), width, trainSize * (i + 1));

    // activity
    plot.noFill();
    plot.stroke(subject.color);
    plot.beginShape();
    for (let j in waves[i]) {
      plot.vertex(
        plot.width - j,
        trainSize * (i + 1) - waves[i][j] * (trainSize - 5)
      );
    }
    plot.endShape();

    if (waves[i].length > width) {
      waves[i].pop();
    }
  }
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
    this.color = restColor;
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
    this.color = lerpColor(
      this.restColor,
      this.spikeColor,
      this.activation / (this.threshold + this.dampening + inhibition)
    );

    if (this.activation > 0) {
      this.activation -= this.rebalance_speed;
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

    fill(this.color);
    ellipse(this.pos.x, this.pos.y, size, size);

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

class ReadNode extends Node {
  constructor(pos) {
    super(pos, -1);
  }
  update() {
    if (this.activation > this.threshold) {
      this.activation = 0;
    }

    if (this.activation > 0) {
      this.activation -= this.rebalance_speed;
    }

    if (this.activation < 0) {
      this.activation = 0;
    }

    this.color = lerpColor(
      this.restColor,
      this.spikeColor,
      this.activation / this.threshold
    );
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
          this.activation / this.threshold
        )
      );
      ellipse(this.pos.x, this.pos.y, size, size);
    }
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
            strokeWeight(1);
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

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
