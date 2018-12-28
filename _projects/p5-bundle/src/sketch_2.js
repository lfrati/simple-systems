import * as tf from '@tensorflow/tfjs';
import World from './world';
import Agent from './agent';
import P5 from 'p5';

export default function neuro_evo(p5) {
    // World dimensions
    let width = 640;
    let height = 480;
    let world;

    let numAgents = 10;

    let foodAmount = 100;
    let foodBuffer = 50;
    let foodSize = 8;

    let epoch = 0;

    let p;

    function populateWorld() {
        epoch = 0;
        // Setup simulation elements ---------------------------------------------
        world = new World(p, height, width, foodAmount, foodBuffer, foodSize);
        for (let i = 0; i < numAgents; i++) {
            let position = p.createVector(p.random(width), p.random(height));
            let agent = new Agent(p, world, position);
            let randomVelocity = P5.Vector.random2D();
            randomVelocity.setMag(agent.maxspeed);
            agent.acceleration = randomVelocity;
            world.agents.push(agent);
        }
    }

    //p5.disableFriendlyErrors = true;
    p5.setup = () => {
        // Operations are too small for GPU
        tf.setBackend('cpu');
        // Setup buttons, sliders and canvas -------------------------------------
        let cnv = p5.createCanvas(width, height);
        cnv.mousePressed(() => {
            p5.noLoop();
            world.agents.forEach(agent => console.log(agent.velocity.mag()));
        });
        cnv.mouseReleased(() => {
            p5.loop();
        });
        p = p5;
        populateWorld();
    };

    p5.draw = () => {
        if (world.agents.length <= 0) return;

        p5.background(0);

        world.displayFood();
        //world.foodQuadtree.displayQuads(p5);
        world.agents.forEach(agent => agent.display());

        epoch += 1;

        world.newEpoch();
        world.growFood();

        // Draw FPS (rounded to 1 decimal places) at the bottom left of the screen
        var fps = p5.frameRate();
        p5.fill(255);
        p5.stroke(0);
        p5.text(
            'FPS: ' + fps.toFixed(1) + '\nEpoch: ' + epoch + '\nAgents: ' + world.agents.length,
            10,
            20
        );
    };
}
