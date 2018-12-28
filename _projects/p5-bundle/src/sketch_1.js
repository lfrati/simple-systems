import { QuadTree, Rectangle, Point, Circle } from './quadtree';
import Boid from './boid';
import Controller from './controller';
import * as P5 from 'p5';

function showFPS(p5) {
    var fps = p5.frameRate();
    p5.fill(255);
    p5.stroke(0);
    p5.text(
        'FPS: ' + Math.floor(fps), //.toFixed(2), //+ '\nEpoch: ' + epoch + '\nAgents: ' + world.agents.length,
        10,
        20
    );
}

export default function full_flock(p5) {
    const capacity = 5;
    const width = 640;
    const height = 360;
    const perception = 25;
    let quad;
    let boids = [];
    let alignSlider, cohesionSlider, separationSlider;
    let control;

    function myclick() {
        console.log(p5.mouseX, p5.mouseY);
        control.press();
    }

    // runs once to set up the canvas
    p5.setup = () => {
        var cnv = p5.createCanvas(width, height);
        cnv.mousePressed(myclick);

        alignSlider = document.getElementById('alignment');
        cohesionSlider = document.getElementById('cohesion');
        separationSlider = document.getElementById('separation');

        p5.rectMode(p5.CENTER); // the first two arguments of a rect are now its center point, not corner

        let boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
        quad = new QuadTree(boundary, capacity);

        for (let i = 0; i < 200; i++) {
            let boid = new Boid(width, height, p5);
            boids.push(boid);
            let point = new Point(boid.position.x, boid.position.y, boid);
            quad.insert(point);
        }
        control = new Controller(width, height, p5);
        p5.noLoop();
    };

    // runs at every frame
    p5.draw = () => {
        p5.background(50);
        // Draw FPS (rounded to 1 decimal places) at the bottom left of the screen
        showFPS(p5);

        let alignment = parseFloat(alignSlider.value);
        let cohesion = parseFloat(cohesionSlider.value);
        let separation = parseFloat(separationSlider.value);

        boids.forEach(boid => {
            boid.edges();
            // TODO: compute neighbours based on range
            let range = new Circle(boid.position.x, boid.position.y, perception);
            let points = quad.query(range);
            let neigbours = points.reduce((acc, point) => {
                let other = point.data;
                if (other != boid) {
                    acc.push(point.data);
                }
                return acc;
            }, []);
            //console.log(typeof parseFloat(alignSlider.value));
            boid.flock(neigbours, alignment, cohesion, separation);
        });

        // Re-populating quadtree
        quad.clear();
        boids.forEach(boid => {
            boid.update();
            boid.show();
            let point = new Point(boid.position.x, boid.position.y, boid);
            quad.insert(point);
        });
        // Showing quadtree sectors
        quad.displayQuads(p5);

        p5.line(p5.mouseX - 6, p5.mouseY, p5.mouseX + 6, p5.mouseY);
        p5.line(p5.mouseX, p5.mouseY - 6, p5.mouseX, p5.mouseY + 6);

        control.overlay();
    };
}
