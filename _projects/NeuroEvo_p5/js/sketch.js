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
let width = 640;
let height = 480;
let world;

let numAgents = 10;

let foodAmount = 100;
let foodBuffer = 50;
let foodSize = 8;

let plottingRate = 10;
let foodGrowthRate = 1;

let epoch = 0;

function deleteINDEXEDDB(databaseName) {
    var req = indexedDB.deleteDatabase(databaseName);
    req.onsuccess = function() {
        console.log('Deleted ' + databaseName + ' successfully');
    };
    req.onerror = function() {
        console.log("Couldn't delete " + databaseName);
    };
    req.onblocked = function() {
        console.log("Couldn't delete " + databaseName + ' due to the operation being blocked');
    };
}

async function loadModels() {
    let newAgents = [];
    let models = await tf.io.listModels();
    console.log('Loading Population');
    for (const [key, value] of Object.entries(models)) {
        let model = await tf.loadModel(key);
        const agent = new Agent();
        agent.brain.model = model;
        newAgents.push(agent);
    }
    console.log('Population loaded');

    if (newAgents.length > 0) {
        world.agents = [];
        world.agents = newAgents;
    }
}

function saveModels() {
    var counter = 0;
    deleteINDEXEDDB('tensorflowjs');
    console.log('Saving population at epoch ' + epoch);
    let promises = world.agents.reduce((promises, agent) => {
        promises.push(
            agent.brain.model.save('indexeddb://' + epoch + '-' + agent.age + '-' + counter)
        );
        counter++;
        return promises;
    }, []);
    Promise.all(promises).then(() => {
        console.log('Population saved');
    });
}

function setupPlotly() {
    // Setup plotting --------------------------------------------------------
    var trace1 = {
        y: [],
        mode: 'lines',
        name: 'food available'
    };

    var trace2 = {
        y: [],
        mode: 'lines',
        name: 'agents resources'
    };

    var data = [trace1, trace2];

    var layout = {
        //title: 'Title of the Graph',
        xaxis: {
            title: 'Epochs'
        },
        yaxis: {
            //range: [0, 100]
            rangemode: 'tozero'
        },
        autosize: false,
        width: 500,
        height: 200,
        margin: {
            l: 50,
            r: 50,
            b: 70,
            t: 30,
            pad: 10
        },
        dragmode: 'pan'
    };

    var options = {
        modeBarButtonsToRemove: [
            'sendDataToCloud',
            'autoScale2d',
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            'lasso2d',
            'select2d',
            'toggleSpikelines',
            'zoomIn2d',
            'zoomOut2d'
        ],
        displaylogo: false,
        displayModeBar: true
    };

    Plotly.plot('chart', data, layout, options);
}

var cnt = 0;

function updatePlots() {
    cnt++;

    let foodAvailable = world.countFood();

    let agentsHealth = world.agents.reduce((healthSum, agent) => {
        return healthSum + agent.health;
    }, 0);

    Plotly.extendTraces(
        'chart',
        {
            y: [[foodAvailable]]
        },
        [0]
    );

    Plotly.extendTraces(
        'chart',
        {
            y: [[agentsHealth]]
        },
        [1]
    );

    if (cnt > 500) {
        Plotly.relayout('chart', {
            xaxis: {
                range: [cnt - 500, cnt]
            }
        });
    }
}

function checkMousePressed() {
    return mouseIsPressed && 0 < mouseX && mouseX < width && 0 < mouseY && mouseY < height;
}

function checkSliders() {
    // How fast should we speed up
    let cycles = speedSlider.value();
    speedSpan.html(cycles);
    let metabolicRate = metabolSlider.value() / 1000;
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
    tf.setBackend('cpu');
    // Setup buttons, sliders and canvas -------------------------------------
    let canvas = createCanvas(width, height);
    canvas.parent('canvascontainer');
    debug = select('#debug');
    show = select('#show');
    stop = select('#stop');
    circle = select('#circle');
    immortal = select('#immortal');
    speedSlider = select('#speedSlider');
    speedSpan = select('#speed');
    metabolSlider = select('#metabolSlider');
    metabolSpan = select('#metabol');
    mutationSlider = select('#mutationSlider');
    mutationSpan = select('#mut');

    save = createButton('save')
        .position(10, 10)
        .mousePressed(saveModels);

    load = createButton('load')
        .position(60, 10)
        .mousePressed(loadModels);

    reset = createButton('reset')
        .position(110, 10)
        .mousePressed(() => populateWorld());

    // del = createButton('delete')
    //     .position(200, 10)
    //     .style('background-color', 'hsl(12, 100%, 55%)')
    //     .mousePressed(() => deleteINDEXEDDB('tensorflowjs'));

    // Clear indexeddb from previous tensorflowjs models
    deleteINDEXEDDB('tensorflowjs');

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
            world.agents.forEach(agent => agent.display());
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
            'FPS: ' + fps.toFixed(1) + '\nEpoch: ' + epoch + '\nAgents: ' + world.agents.length,
            10,
            20
        );
    }

    if (checkMousePressed()) {
        //let newFood = createVector(mouseX, mouseY);
        //world.storeFood(newFood);
        world.agents[0].position = createVector(mouseX, mouseY);
    }
}
