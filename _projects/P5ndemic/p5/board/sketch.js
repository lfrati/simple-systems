let worldLayer;
let nodes_list;
let diameter = 25;
let radius = diameter / 2;
let node_selected = [];

let slices;
let color2idx = { red: 0, yellow: 1, blue: 2, black: 3 };
let idx2color = ["red", "yellow", "blue", "black"];
let pix2idx = {};

function infect(city, disease) {
  console.log("infecting", city, disease);
  let curr_level = nodes_dict[city].levels[disease];
  if (curr_level < 3) {
    nodes_dict[city].levels[disease] += 1;
    return false;
  } else {
    return true;
  }
}

function popFrom(set) {
  for (let value of set) {
    return value;
  }
}

function toArray(obj, includeKey) {
  let newArr = [];
  keys = Object.keys(obj);
  for (let key of keys) {
    if (includeKey) {
      newArr.push([key, obj[key]]);
    } else {
      newArr.push(obj[key]);
    }
  }
  return newArr;
}

function getRandomSubarray(arr, size) {
  let shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

function coords2canvas(lat, lng) {
  return [map(lng, -180, 180, -100, width), map(lat, -90, 90, height + 100, 0)];
}

function makeWorld() {
  let world = createGraphics(width, height);
  let polys = [];
  for (let [country, poly] of toArray(countries, true)) {
    if (country != "ATA") {
      let new_coords = poly.map(coords => {
        let [lng, lat] = coords;
        // not mapping 0 | width height | 0 in order to properly center the world
        return coords2canvas(lat, lng);
      });
      polys.push([country, new_coords]);
    }
  }

  // Generate background map
  world.background(152, 216, 237);
  world.stroke(120);
  world.strokeWeight(1);
  world.fill(160);
  for (let el of polys) {
    let [_, poly] = el;
    world.beginShape();
    for (let coord of poly) {
      let [x, y] = coord;
      world.vertex(x, y);
    }
    world.endShape(CLOSE);
  }
  return world;
}

function checkWrap(from, to) {
  let wraps = [
    ["los angeles", "sydney"],
    ["san francisco", "tokyo"],
    ["san francisco", "manila"]
  ];

  let from_city = nodes_list[from].name;
  let to_city = nodes_list[to].name;
  let [from_x, from_y] = nodes_list[from].xy;
  let [to_x, to_y] = nodes_list[to].xy;

  for (let pair of wraps) {
    let [a, b] = pair;
    if (a == from_city && b == to_city) {
      worldLayer.line(from_x, from_y, to_x - width, to_y);
      return false;
    }
    if (b == from_city && a == to_city) {
      worldLayer.line(from_x, from_y, to_x + width, to_y);
      return false;
    }
  }
  return true;
}

function keyTyped() {
  if (node_selected) {
    if (key === "i") {
      let disease = color2idx[node_selected.color];
      let city = node_selected.name;
      let overflow = infect(city, disease);

      if (overflow) {
        //console.log("overflow", city);
        let visited_nodes = new Set([node_selected.id]);
        let nodes_to_visit = new Set(edges[node_selected.id]);
        //console.log(visited_nodes, nodes_to_visit);
        let safety = 0;
        while (nodes_to_visit.size > 0 && safety < 100) {
          safety += 1;
          let visiting = popFrom(nodes_to_visit);
          nodes_to_visit.delete(visiting);
          visited_nodes.add(visiting);
          if (infect(nodes_list[visiting].name, disease)) {
            for (let id of edges[visiting]) {
              if (!visited_nodes.has(id)) {
                nodes_to_visit.add(id);
                //console.log("new nodes", nodes_to_visit);
              }
            }
          }
        }
      }
    } else if (key === "c") {
      let c = color(get(mouseX, mouseY));
      let level = pix2idx[c.toLocaleString()];
      console.log(c, c.toLocaleString(), level);
      console.log("curing");
      if (node_selected.levels[level] > 0) {
        node_selected.levels[level] -= 1;
      }
    }
  }
}

function showInfection(x, y, levels) {
  let sectorSize = TWO_PI / 3;
  let sliceSize = TWO_PI / 12;
  for (let id in levels) {
    let level = levels[id];
    let col = idx2color[id];
    fill(col);
    noStroke();
    for (let i = 0; i < level; i++) {
      let from = -HALF_PI + sliceSize * id + sectorSize * i;
      let to = from + sliceSize;
      arc(x, y, diameter, diameter, from, to, PIE);
    }
  }
}

function setup() {
  for (let col of Object.keys(color2idx)) {
    pix2idx[color(col).toLocaleString()] = color2idx[col];
  }
  randomSeed(8);
  frameRate(30);
  createCanvas(180 * 2 * 2.5, 90 * 2 * 2.5);

  slices = [
    [-HALF_PI, -HALF_PI + TWO_PI / 3],
    [-HALF_PI + TWO_PI / 3, -HALF_PI + (2 * TWO_PI) / 3],
    [-HALF_PI + (2 * TWO_PI) / 3, -HALF_PI]
  ];

  worldLayer = makeWorld();

  nodes_list = toArray(nodes_dict, false);
  for (let id in nodes_list) {
    let node = nodes_list[id];
    let [x, y] = coords2canvas(...node.coords);
    node.xy = [x, y];
    node.levels = [0, 0, 0, 0];
    node.id = int(id);
  }

  nodes_dict = {};
  for (let node of nodes_list) {
    nodes_dict[node.name] = node;
  }

  let changing = true;
  while (changing) {
    changing = false;
    for (let node of nodes_list) {
      for (let other of nodes_list) {
        if (other != node) {
          let d = dist(...node.xy, ...other.xy);
          if (d < diameter) {
            changing = true;
            if (random() < 0.5) {
              let tmp = node;
              node = other;
              other = tmp;
            }
            let nodeVec = createVector(...node.xy);
            let otherVec = createVector(...other.xy);
            let dir = otherVec.sub(nodeVec);
            dir = dir.setMag(dir.mag() * 1.1);
            nodeVec = nodeVec.sub(dir);
            node.xy = [nodeVec.x, nodeVec.y];
          }
        }
      }
    }
  }
  edges = toArray(edges, false);

  for (let from in edges) {
    for (let to of edges[from]) {
      worldLayer.stroke(100);
      if (checkWrap(from, to)) {
        let [from_x, from_y] = nodes_list[from].xy;
        let [to_x, to_y] = nodes_list[to].xy;
        worldLayer.line(from_x, from_y, to_x, to_y);
      }
    }
  }

  for (let node of nodes_list) {
    let [x, y] = node.xy;
    worldLayer.noStroke();
    let col = color(node.color);
    col.setAlpha(70);
    worldLayer.fill(col);
    worldLayer.ellipse(x, y, diameter);
    worldLayer.noStroke();
    worldLayer.fill("black");
    let [off_x, off_y] = node.text_offset;
    worldLayer.text(node.name, x + radius + off_x, y + off_y);
  }

  worldLayer.fill(80, 0, 120);
  worldLayer.textSize(16);
  worldLayer.text(
    "Press i to infect city\nSelect color and press c to cure",
    5,
    20
  );

  image(worldLayer, 0, 0);
  frameRate(20);
  cursor(CROSS);
}

function draw() {
  clear();
  image(worldLayer, 0, 0);
  let selecting = false;
  for (let node of nodes_list) {
    let [x, y] = node.xy;
    if (dist(mouseX, mouseY, x, y) < radius) {
      node_selected = node;
      selecting = true;
      fill(255, 50);
      ellipse(x, y, diameter);
      fill(0);
      noStroke();
      textSize(36);
      text(node.name, 10, height - 20);

      let from = node_selected.id;
      for (let to of edges[from]) {
        //stroke(node_selected.color);
        stroke(50);
        strokeWeight(2);
        if (checkWrap(from, to)) {
          let [from_x, from_y] = nodes_list[from].xy;
          let [to_x, to_y] = nodes_list[to].xy;
          line(from_x, from_y, to_x, to_y);
        }
      }
    }
    showInfection(x, y, node.levels);
  }
  if (!selecting) {
    node_selected = undefined;
  }
}
