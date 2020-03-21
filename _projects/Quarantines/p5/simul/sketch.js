let nodes = [];
let links = [];
let carriers = [];
let tot_agents;

const poisson_spread = 30;
const families = 30;
const link_range = 60;
const num_family_members = 3;
const walk_length = 2;

const infection_prob = 0.1;
const infection_decay = 0.003;
const dirtying_prob = 0.3;
const recovery_speed = 0.01;
const reduced_viral_load = 0.1;

const canvas_occupation = 8 / 10;
const plot_border = 10;
const plot_height = 50;
const show_range = false;

// colors to be used
let sick_home;
let healthy_home;
let static; // static background images

let healthy_hist = [];
let infected_hist = [];
let immune_hist = [];

let ui;

class UI {
  constructor() {
    this.x = width / 2 + 10;
    this.y = height - 70;

    this.locality = createSlider(0, 1, 1, 0.1);
    this.locality.position(this.x + 15, this.y + 10);
    this.locality_width = 90;
    this.locality.style(`width : ${this.locality_width}px`);
    this.locality.style("font-family: Arial");
    this.locality.changed(() => {
      reset();
    });
    this.locality.mousePressed(() => {
      this.locality_color = color(168, 171, 179);
    });
    this.locality_color = color(219, 45, 33);

    this.speedup = createSlider(1, 20, 10, 1);
    this.speedup.position(this.x + this.locality_width + 130, this.y + 10);
    this.speedup_width = 60;
    this.speedup.style(`width : ${this.speedup_width}px`);
    this.speedup.style("font-family: Arial");
    this.speedup.mousePressed(() => {
      this.speedup_color = color(168, 171, 179);
    });
    this.speedup_color = color(219, 45, 33);

    this.quarantine_length = createSlider(5, 30, 15, 5);
    this.quarantine_length.position(
      this.x + this.locality_width + 130,
      this.y + 40
    );
    this.quarantine_length_width = 60;
    this.quarantine_length.style(`width : ${this.quarantine_length_width}px`);
    this.quarantine_length.style("font-family: Arial");
    this.quarantine_length.mousePressed(() => {
      this.quarantine_length_color = color(168, 171, 179);
    });
    this.quarantine_length_color = color(219, 45, 33);

    this.immunity = createCheckbox("Immunity", false);
    this.immunity.style("color:rgb(219, 45, 33)");
    this.immunity.style("font-family: Arial");
    this.immunity.style("font-size: 80%");
    this.immunity.position(this.x + 10, this.y + 40);
    this.immunity.changed(() => {
      reset();
      this.immunity.style("color:rgb(168, 171, 179)");
    });

    this.self_quarantine = createCheckbox("Self-quarantine", false);
    this.self_quarantine.style("color:rgb(219, 45, 33)");
    this.self_quarantine.style("font-family: Arial");
    this.self_quarantine.style("font-size: 80%");
    this.self_quarantine.position(this.x + 90, this.y + 40);
    this.self_quarantine.changed(() => {
      reset();
      this.self_quarantine.style("color:rgb(168, 171, 179)");
    });

    this.reset = createButton("RESET");
    this.reset.position(this.x + 325, this.y - 20);
    this.reset.mousePressed(() => reset());
  }

  show() {
    textSize(14);
    noStroke();
    let { x, y } = this.locality.position();
    fill(this.locality_color);
    text(
      `Locality: ${this.locality.value()}`,
      x + this.locality_width + 10,
      y + 15
    );
    //let { i, j } = this.speedup.position(); FOR SOME FUCKING REASONS THIS DOESNT WORK
    fill(this.speedup_color);
    text(
      `Speedup: ${this.speedup.value()}`,
      this.speedup.x + this.speedup_width + 10,
      this.speedup.y + 15
    );
    fill(this.quarantine_length_color);
    text(
      `Isolation: ${this.quarantine_length.value()}`,
      this.quarantine_length.x + this.quarantine_length_width + 10,
      this.quarantine_length.y + 15
    );
  }
}

// UTILITY FUNCTIONS ########################################

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function inverse(link) {
  return link.to.out.find(x => x.to == link.from);
}

function random_walk_and_back(link) {
  let path = [link];
  let return_path = [inverse(link)];
  let curr = link;

  for (let i = 0; i < walk_length; i++) {
    let opts = curr.to.out.filter(x => x.to != curr.from);
    if (opts.length > 1) {
      let next = random(opts);
      path.push(next);
      let inv = inverse(next);
      return_path.unshift(inv);
      curr = next;
    }
  }

  return path.concat(return_path);
}

// click to infect houses
function mousePressed() {
  for (let node of nodes) {
    if (dist(node.pos.x, node.pos.y, mouseX, mouseY) < 10) {
      node.infection_level = 1;
    }
  }
}

function make_nodes() {
  nodes = [];
  // create houses ################
  /* Random locations
  for (let i = 0; i < families; i++) {
    let x = 40 + random(width - 50)
    let y = 40 + random(height - 50)
    let pos = createVector(x, y)
    nodes.push(new Node(pos, i))
  }
  */

  // Poisson disc locations
  let locations = poisson_disc(poisson_spread, canvas_occupation);
  for (let i in locations) {
    let pos = locations[i];
    nodes.push(new Node(pos, i));
  }
}

function wire_nodes() {
  // connect locations  #################
  // erdos-reny?
  /*for (let i = 0; i < 200; i++) {
    let source = random(nodes)
    let destin = random(nodes.filter(x => x != source))
    links.push(new Link(source, destin))
  }
  */
  links = [];
  let link_id = 0;
  for (let source of nodes) {
    // geometric links within range
    for (let other of nodes) {
      if (source != other) {
        if (p5.Vector.dist(source.pos, other.pos) <= source.range) {
          links.push(new Link(source, other, link_id));
          link_id += 1;
        }
      }
    }
  }
  let longdistances = shuffle(nodes).splice(
    int(nodes.length * ui.locality.value())
  );
  for (let source of longdistances) {
    // 1 small world link per house
    let destin = random(nodes.filter(x => x != source));
    links.push(new Link(source, destin, link_id));
    link_id += 1;
    links.push(new Link(destin, source, link_id));
    link_id += 1;
  }
}

function assign_families() {
  carriers = [];
  for (let node of nodes) {
    node.members = [];
  }
  // initialize family members #############
  for (let node of nodes) {
    for (let i = 0; i < num_family_members; i++) {
      let agent = new Carrier(random(node.out), node);
      carriers.push(agent);
      node.members.push(agent);
    }
  }
  tot_agents = nodes.length * num_family_members;
}

function draw_world() {
  // prepare background #############
  static.background(50);
  for (let link of links) {
    link.draw(static);
  }
  for (let node of nodes) {
    node.draw(static);
  }
}
function reset() {
  make_nodes();
  wire_nodes();
  assign_families();
  draw_world();
  healthy_hist = [];
  infected_hist = [];
}

// MAIN LOOP ########################################

function setup() {
  createCanvas(800, 600);
  static = createGraphics(width, height);
  static.clear();
  ui = new UI();
  frameRate(30);

  healthy_home = color(67, 186, 56); // healthy green
  sick_home = color(217, 50, 28); // dangerous red

  reset(); // needs to be after UI and the above color definitions
}

function show_paths(node) {
  // show member paths
  for (let member of node.members) {
    for (let edge of member.path) {
      edge.show();
    }
  }
}

function mouse_interaction() {
  for (let node of nodes) {
    // check if nodes are selected
    if (dist(node.pos.x, node.pos.y, mouseX, mouseY) < node.radius / 2) {
      node.selected = true;
      show_paths(node);
    } else {
      node.selected = false;
    }
  }
}

function draw() {
  //carriers.filter(x => x.sick == false).length > 0)
  image(static, 0, 0);
  //background(50);

  ui.show();
  mouse_interaction();

  for (let i = 0; i < ui.speedup.value(); i++) {
    for (let node of nodes) {
      node.update();
    }
    for (let carrier of carriers) {
      carrier.update();
      //carrier.show();
    }
  }

  for (let node of nodes) {
    node.show();
  }
  for (let carrier of carriers) {
    carrier.update();
    //carrier.show();
  }

  healthy_hist.push(
    carriers.filter(x => x.infected == false && x.sick == false).length
  );
  infected_hist.push(carriers.filter(x => x.infected == true).length);
  if (healthy_hist.length > width) {
    healthy_hist.shift();
  }
  if (infected_hist.length > width) {
    infected_hist.shift();
  }

  stroke(200);
  strokeWeight(1);
  line(
    0,
    height - plot_border - plot_height,
    width / 2,
    height - plot_border - plot_height
  );
  line(0, height - plot_border, width / 2, height - plot_border);
  plot(healthy_hist, "green");
  plot(infected_hist, "red");
}

function plot(hist, col) {
  noFill();
  stroke(col);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < hist.length; i++) {
    vertex(i / 2, height - plot_border - (hist[i] / tot_agents) * plot_height);
  }
  endShape();
}

// CLASSES ########################################

class Carrier {
  constructor(link, home) {
    this.progress = 0;
    this.speed = 2 + random() * 2;
    this.location = 0;
    this.home = home;
    this.path = random_walk_and_back(link);
    this.curr = this.path[this.location];
    this.sick = false;
    this.infected = false;
    this.quarantined = false;
    this.immune = false;
    this.recovery_time = ui.quarantine_length.value();
  }

  show() {
    if (this.infected || this.home.selected) {
      fill(255, 0, 50);
    } else {
      if (this.immune) {
        fill(250, 172, 249);
      } else {
        fill(150, 250, 80);
      }
    }
    noStroke();
    let from = this.curr.from;
    let to = this.curr.to;
    let curr_loc = p5.Vector.lerp(
      from.pos,
      to.pos,
      this.progress / this.curr.len
    );
    ellipse(curr_loc.x, curr_loc.y, 5);
  }

  update() {
    // when sick stay home until healed, otherwise go on with the routine path
    if (!this.sick) {
      this.progress += this.speed;
      if (this.progress >= this.curr.len) {
        // destination reached

        let node = this.curr.to;

        // check for potential infections ################
        // infect location
        if (this.infected && random() < dirtying_prob) {
          if (this.immune) {
            node.infection_level += reduced_viral_load;
          } else {
            node.infection_level = 1;
          }
        }
        if (this.immune) {
          // I'm not sick, I'm just dirty, so I'll spread only once
          this.infected = false;
        }
        //get infected
        if (
          !this.infected &&
          node.infection_level > 0 &&
          random() < infection_prob
        ) {
          this.infected = true;
          this.recovery_time = ui.quarantine_length.value();
        }

        // move to next link
        this.progress = 0;
        this.location = (this.location + 1) % this.path.length;

        if (!this.immune && this.infected && this.location == 0) {
          // arrived home, wake up sick
          this.sick = ui.self_quarantine.checked(); // set to false to remove quarantine
          this.quarantined = ui.self_quarantine.checked();
          this.healing = true;
        }

        this.curr = this.path[this.location];
      }
    }
    if (this.healing) {
      this.recovery_time -= recovery_speed;
      if (this.recovery_time < 0) {
        // recovered, can be infected again
        this.infected = false;
        this.sick = false;
        this.immune = ui.immunity.checked();
      }
    }
  }
}

class Node {
  constructor(pos, node_id) {
    this.in = [];
    this.out = [];
    this.members = [];
    this.pos = pos;
    this.range = link_range;
    this.node_id = node_id;
    this.selected = false;
    this.infection_level = 0;
    this.radius = 10;
  }

  draw(cnvs) {
    cnvs.fill(healthy_home);
    cnvs.ellipse(this.pos.x, this.pos.y, this.radius);
    if (show_range) {
      cnvs.noFill();
      cnvs.stroke(200, 30);
      cnvs.ellipse(this.pos.x, this.pos.y, this.range * 2);
    }
  }

  show() {
    let col = lerpColor(healthy_home, sick_home, this.infection_level);
    fill(col);
    noStroke();
    let num_sick = this.members.filter(x => x.sick).length;
    ellipse(this.pos.x, this.pos.y, this.radius + (this.radius / 2) * num_sick);
  }

  update() {
    if (this.infection_level > 0) {
      this.infection_level -= infection_decay;
    } else {
      this.infection_level = 0;
    }
  }
}

class Link {
  constructor(source, destin, link_id) {
    this.from = source;
    this.to = destin;
    this.len = p5.Vector.dist(this.from.pos, this.to.pos); // assume nodes are static
    this.id = link_id;
    source.out.push(this);
    destin.in.push(this);
  }

  draw(cnvs) {
    cnvs.stroke(255, 50);
    cnvs.line(this.from.pos.x, this.from.pos.y, this.to.pos.x, this.to.pos.y);
  }

  show(highlight) {
    strokeWeight(1);
    stroke(200, 150, 50);
    line(this.from.pos.x, this.from.pos.y, this.to.pos.x, this.to.pos.y);
  }
}
