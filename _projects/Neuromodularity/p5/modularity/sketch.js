let spacing = 50;
let buffer = 20; // Leave some space around the network
let node_diameter = 10; // How big should the nodes be?
let locality = 100;
let nonLocal_links = 20;
let mu = 200;

let network;
let reset_btn, seed_btn, slider, muSpan;

// Palette
let spikeColor;
let restColor;
let white;
let green;
let red;

let activities = [];

let communitiesID = [];
let communitiesNodes = [];
let communitiesList = [];
let node2comm = {};
let palette = [];
let within = [];
let between = [];

let staticBackground;

// Interface
let max_signals = 1000; // Limit number of infected agents to avoid killing my computer

function mousePressed() {
  network.progress = 0;
  for (let node of network.nodes) {
    let d = dist(mouseX, mouseY, node.pos.x, node.pos.y);
    if (d < 10) {
      network.nodes[node.id].fire(true, 1);
    }
  }
}

function reset() {
  cur_signals = 0;
  activities = [];
  within = [];
  between = [];
  network = new Network(4, 3);
  network.makeLattice();
  network.computeCommunities();
  network.wireCommunities();
  network.modularize(mu);
  staticBackground.background(50);
  network.show(staticBackground);
  muSpan.html(" &#x3BC; : " + str(mu));
}

function setup() {
  cnv = createCanvas(600, 600);
  staticBackground = createGraphics(width, height);
  staticBackground.clear();

  // colors
  spikeColor = color(255, 0, 50);
  restColor = color(0, 65, 225);
  white = color(255, 255, 255);
  red = color(255, 0, 0);
  green = color(0, 255, 0);

  reset_btn = createButton("reset");
  reset_btn.mousePressed(() => {
    reset();
  });
  seed_btn = createButton("seed");
  seed_btn.mousePressed(() => {
    let seedComm = random(communitiesList);
    for (let node of communitiesNodes[seedComm]) {
      node.fire(true, 1);
    }
  });
  slider = createSlider(0, 0.5, 0, 0.01);
  slider.input(() => {
    mu = slider.value();
    reset();
  });
  mu = slider.value();
  muSpan = createSpan(" &#x3BC; : " + str(mu));
  muSpan.style("font-size:18pt");

  reset();
  frameRate(30);
}

function draw() {
  // background(50);
  image(staticBackground, 0, 0);

  // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
  // let fps = frameRate();
  // fill(255);
  // stroke(0);
  // textSize(15);
  // text("FPS: " + fps.toFixed(0), width - 100, height - 20);

  network.animate();
  network.update();
}

class Network {
  constructor(c, NC) {
    this.progress = 0;
    this.dt = 0.04;
    this.c = c;
    this.commSize = c * c;
    this.commsPerSide = NC;
    this.numComms = NC * NC;
    this.N = this.numComms * this.commSize;
    this.numNodes = NC;
    this.nodes = [];
    this.links = [];
    this.adj = Array(this.N)
      .fill()
      .map(() => Array(this.N).fill(0));
  }

  makeLattice() {
    let ID = 0;

    for (let i = 0; i < this.c * this.commsPerSide; i++) {
      for (let j = 0; j < this.c * this.commsPerSide; j++) {
        let x = buffer + i * spacing;
        let y = buffer + j * spacing;
        let pos = createVector(x, y);
        this.nodes.push(new Node(pos, ID));
        ID += 1;
      }
    }
  }

  computeCommunities() {
    communitiesID = [];
    communitiesNodes = [];
    node2comm = {};
    communitiesList = [];
    for (let i = 0; i < this.numComms; i++) {
      communitiesList.push(i);
    }
    let commID = 0;
    for (let c = 0; c < this.numComms; c++) {
      let col = lerpColor(
        color(255, 0, 0),
        color(0, 0, 255),
        c / this.numComms
      );
      palette.push(col);
    }

    palette = shuffle(palette);

    for (let i = 0; i < this.commsPerSide; i++) {
      for (let j = 0; j < this.commsPerSide; j++) {
        let communityIDs = [];
        let communityNodes = [];

        for (let k = 0; k < this.c; k++) {
          for (let z = 0; z < this.c; z++) {
            let id =
              this.commsPerSide * this.commSize * i +
              this.c * j +
              z +
              k * (this.commsPerSide * this.c);
            node2comm[id] = commID;
            communityIDs.push(id);
            communityNodes.push(this.nodes[id]);
          }
        }
        commID += 1;
        communitiesID.push(communityIDs);
        communitiesNodes.push(communityNodes);
      }
    }
  }

  rewire(link, newTo) {
    // unwire destination
    link.to.in.splice(link.to.in.indexOf(link), 1);

    // change destination
    link.to = newTo;

    // wire destination
    link.to.in.push(link);
  }

  modularize(mu) {
    let tot = within.length;
    let target = int(tot * mu);
    for (let i = 0; i < target; i++) {
      // pick edge to rewire
      let link = random(within);
      // remove link from "within" list
      within.splice(within.indexOf(link), 1);
      // find out current community
      let from = link.from;
      let currComm = node2comm[from.id];
      // pick new community
      let opts = communitiesList.filter(comm => {
        return comm != currComm;
      });
      let newComm = random(opts);
      let newTo = random(communitiesNodes[newComm]);
      this.rewire(link, newTo);
      between.push(link);
    }
  }

  wireCommunities() {
    this.links = [];

    for (let node of this.nodes) {
      node.out = [];
      node.in = [];
    }

    for (let community of communitiesNodes) {
      for (let from of community) {
        for (let to of community) {
          if (to != from) {
            let link = new Link(from, to);
            from.out.push(link);
            to.in.push(link);
            this.links.push(link);
            this.adj[from.id][to.id] = 1;
            within.push(link);
          }
        }
      }
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
      // node.update();
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

  show(staticBackground) {
    for (let link of this.links) {
      link.show(staticBackground);
    }
    for (let node of this.nodes) {
      node.show(staticBackground);
    }
  }
}

class Node {
  constructor(pos, ID) {
    this.pos = pos;
    this.id = ID;
    this.out = [];
    this.in = [];
    this.base_threshold = (network.commSize - 1) / 3;
    this.activity = 0;
    this.threshold = this.base_threshold;
    this.fired = false;
  }

  // force is used so that clicking bypasses the infection probability
  fire(force) {
    if (force || this.activity > this.threshold) {
      this.fired = true;
      for (let edge of this.out) {
        // if we have not reached the max amount of carriers add a new one
        edge.fire();
      }
    }
    this.activity = 0;
  }

  deliver(payload) {
    this.activity += payload;
  }

  // update() {
  //   if (this.threshold > this.base_threshold) {
  //     this.threshold -= 0.1;
  //   }
  //   if (this.activity > 0) {
  //     this.activity -= 0.005;
  //   }
  // }

  show(staticBackground) {
    staticBackground.noStroke(); // no border
    staticBackground.fill(palette[node2comm[this.id]]);
    staticBackground.ellipse(
      this.pos.x,
      this.pos.y,
      node_diameter,
      node_diameter
    );
    // textSize(10);
    // text(str(this.id), this.pos.x + 4, this.pos.y);
  }

  animate() {
    noStroke();
    if (this.fired) {
      fill("yellow");
    } else {
      // fill(col);
      fill(palette[node2comm[this.id]]);
    }
    // if (this.activity > 0) {
    //     ellipse(this.pos.x, this.pos.y, node_diameter + this.activity * 5);
    // } else {
    //     ellipse(this.pos.x, this.pos.y, node_diameter);
    // }
    ellipse(this.pos.x, this.pos.y, node_diameter);
  }
}

class Link {
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
      // paint link red if there are carriers travelling on it
      stroke(255, 50, 50); // infected is reddish
      line(this.from.pos.x, this.from.pos.y, this.to.pos.x, this.to.pos.y);
      fill(255);
      noStroke();
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

  show(staticBackground) {
    staticBackground.strokeWeight(1);
    staticBackground.stroke(255, 50); // default is greyish

    staticBackground.line(
      this.from.pos.x,
      this.from.pos.y,
      this.to.pos.x,
      this.to.pos.y
    );
    arrowhead(this.from, this.to, 2, 6, node_diameter, staticBackground);
  }
}

// to show the direction of the link, require some calculation but it's worth it.
function arrowhead(from, to, base, height, distance, canvas) {
  let rot = p5.Vector.sub(to.pos, from.pos).heading(); // get angle of the link
  canvas.push();
  canvas.translate(to.pos.x, to.pos.y); // move the origin to the target the arrow is pointing to
  canvas.rotate(rot); // rotate to align the tip
  canvas.noStroke(); // strong independent arrows need no border
  canvas.fill(255, 50); // a bit of transparency, we want to see them if they overlap
  canvas.triangle(
    -distance / 2 - 1,
    0,
    -distance / 2 - height,
    -base,
    -distance / 2 - height,
    +base
  );
  canvas.pop();
}
