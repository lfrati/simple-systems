// Checkbox to show additional info
let debug;
let show;
let stop;
let stats;
let immortal;
let save;
let load;
let reset;

// Slider to speed up simulation
let speedSlider;
let speedSpan;
let metabolSlider;
let metabolSpan;
let metabolicRate = 0;
let mutationSlider;
let mutationSpan;
let mutationRate = 0;

// World dimensions
let width = 840;
let height = 640;
let world;

let numAgents = 10;

let foodAmount = 200;
let foodBuffer = 50;
let foodSize = 8;

let plottingRate = 10;
let foodGrowthRate = 1;

let epoch = 0;

function setupPlotly() {
  // Setup plotting --------------------------------------------------------
  var trace1 = {
    y: [],
    mode: "lines",
    name: "food available",
  };

  var trace2 = {
    y: [],
    mode: "lines",
    name: "agents resources",
  };

  var data = [trace1, trace2];

  var layout = {
    //title: 'Title of the Graph',
    xaxis: {
      title: "Epochs",
    },
    yaxis: {
      //range: [0, 100]
      rangemode: "tozero",
    },
    autosize: false,
    width: 500,
    height: 200,
    margin: {
      l: 50,
      r: 50,
      b: 70,
      t: 30,
      pad: 10,
    },
    dragmode: "pan",
  };

  var options = {
    modeBarButtonsToRemove: [
      "sendDataToCloud",
      "autoScale2d",
      "hoverClosestCartesian",
      "hoverCompareCartesian",
      "lasso2d",
      "select2d",
      "toggleSpikelines",
      "zoomIn2d",
      "zoomOut2d",
    ],
    displaylogo: false,
    displayModeBar: true,
  };

  Plotly.plot("chart", data, layout, options);
}

var cnt = 0;

function updatePlots() {
  cnt++;

  let foodAvailable = world.countFood();

  let agentsHealth = world.agents.reduce((healthSum, agent) => {
    return healthSum + agent.health;
  }, 0);

  Plotly.extendTraces(
    "chart",
    {
      y: [[foodAvailable]],
    },
    [0]
  );

  Plotly.extendTraces(
    "chart",
    {
      y: [[agentsHealth]],
    },
    [1]
  );

  if (cnt > 500) {
    Plotly.relayout("chart", {
      xaxis: {
        range: [cnt - 500, cnt],
      },
    });
  }
}

function checkSliders() {
  // How fast should we speed up
  let cycles = speedSlider.value();
  speedSpan.html(cycles);
  let metabolicRate = metabolSlider.value() / 1000;
  if (world.agents.length < 5) {
    metabolicRate = 0;
  }
  metabolSpan.html(metabolicRate);
  let mutationRate = mutationSlider.value() / 100;
  mutationSpan.html(mutationRate);
  return [cycles, metabolicRate, mutationRate];
}

function populateWorld() {
  epoch = 0;
  // Setup simulation elements ---------------------------------------------
  world = new World(height, width, foodAmount, foodBuffer, foodSize);
  for (let i = 0; i < numAgents; i++) {
    let agent = new Agent();
    let randomVelocity = p5.Vector.random2D();
    randomVelocity.setMag(agent.maxspeed);
    agent.acceleration = randomVelocity;
    world.agents.push(agent);
  }
}

//p5.disableFriendlyErrors = true;
function setup() {
  // Operations are too small for GPU
  tf.setBackend("cpu");
  // Setup buttons, sliders and canvas -------------------------------------
  let canvas = createCanvas(width, height);

  canvas.mousePressed(() => {
    world.agents[0].position = createVector(mouseX, mouseY);
  });
  canvas.parent("canvascontainer");
  debug = select("#debug");
  show = select("#show");
  stop = select("#stop");
  circle = select("#circle");
  immortal = select("#immortal");
  speedSlider = select("#speedSlider");
  speedSpan = select("#speed");
  metabolSlider = select("#metabolSlider");
  metabolSpan = select("#metabol");
  mutationSlider = select("#mutationSlider");
  mutationSpan = select("#mut");

  setupPlotly();

  populateWorld();
}

function draw() {
  [cycles, metabolicRate, mutationRate] = checkSliders();

  if (world.agents.length <= 0) return;

  if (!stop.checked()) {
    background(0);
    if (show.checked()) {
      world.displayFood();
      //world.foodQuadtree.displayQuads();
      world.agents.forEach((agent) => agent.display());
    }

    // Run the simulation "cycles" amount of time
    for (let n = 0; n < cycles; n++) {
      epoch += 1;
      if (epoch % plottingRate === 0) {
        updatePlots();
      }
      world.newEpoch();
      world.growFood(circle.checked());
    }
    // Draw FPS (rounded to 1 decimal places) at the bottom left of the screen
    var fps = frameRate();
    fill(255);
    stroke(0);
    text(
      "FPS: " +
        fps.toFixed(1) +
        "\nEpoch: " +
        epoch +
        "\nAgents: " +
        world.agents.length,
      10,
      20
    );
  }
}
