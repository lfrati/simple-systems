import Eyes from './sensors';
import Brain from './brain';
import { mod } from './math';

export default class Agent {
    constructor(p5, world, position) {
        // All the physics stuff
        this.p5 = p5;
        this.world = world;
        this.position = position;

        this.acceleration = this.p5.createVector();
        this.velocity = this.p5.createVector();
        this.r = 10;
        this.maxforce = 0.1;
        this.maxspeed = 3;
        this.minspeed = 0.25;
        this.starthealth = 1;
        this.maxhealth = 5;
        this.mutationRate = 25 / 100;
        this.metabolicRate = 15 / 1000;

        this.green = this.p5.color(0, 255, 255, 255);
        this.red = this.p5.color(255, 0, 100, 100);
        this.health = this.starthealth;
        this.age = 0;

        this.numSensors = 8;
        this.sensingRange = 100;
        this.eyes = new Eyes(this.p5, this.world, this.numSensors, this.sensingRange);
        this.brain = new Brain(this.numSensors, 32, 2, this.mutationRate);

        this.hasReproduced = false;
    }

    // Add force to acceleration
    applyForce(force) {
        this.acceleration.add(force);
    }

    // Called each time step
    move() {
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed to max
        this.velocity.limit(this.maxspeed);
        // Keep speed at a minimum
        if (this.velocity.mag() < this.minspeed) {
            this.velocity.setMag(this.minspeed);
        }
        // Update position
        this.position.add(this.velocity);
        // Make world a torus
        this.position.x = mod(this.position.x, this.world.width);
        this.position.y = mod(this.position.y, this.world.height);
        // Reset acceleration to 0 each cycle
        this.acceleration.mult(0);
        // Decrease health
        this.health = this.p5.constrain(this.health, 0, this.maxhealth);
        this.health -= this.metabolicRate;
        // Increase score
        this.age += 1;
    }

    act() {
        let info = this.eyes.sense(this.position);
        let [x, y] = this.brain.think(info);

        let force = this.p5.createVector(x, y);
        this.applyForce(force);
        this.eat();
        this.move();

        return this.reproduce();
    }

    reproduce() {
        let next = { alive: [], dead: [] };

        if (this.health > this.starthealth * 2) {
            this.hasReproduced = true;
            const child = new Agent(this.p5, this.world, this.position);
            child.brain.mutate(this.brain);
            this.health -= child.starthealth;
            next.alive.push(child);
        }

        if (this.health > 0) {
            next.alive.push(this);
        } else {
            next.dead.push(this);
        }
        return next;
    }

    // Check against array of food
    eat() {
        let foods = this.world.searchFood(this.position, this.r);
        for (let food of foods) {
            this.world.consumeFood(food);
            // Add health when it eats food
            this.health++;
        }
    }

    display() {
        // Color based on health
        let col = this.hasReproduced
            ? this.p5.lerpColor(this.red, this.green, this.health)
            : this.p5.color(132, 131, 53);
        // Rotate in the direction of velocity
        let theta = this.velocity.heading() + Math.PI / 2;
        // Translate to current location and draw a triangle
        this.p5.push();
        this.p5.translate(this.position.x, this.position.y);

        // if (debug.checked()) {
        //     this.eyes.display();
        //     let v = this.velocity
        //         .copy()
        //         .div(this.maxspeed)
        //         .mult(this.eyes.sensorLength / 2);
        //     this.p5.stroke(200, 200, 0);
        //     this.p5.strokeWeight(2);
        //     this.p5.line(0, 0, v.x, v.y);
        //     // Display score next to each vehicle
        //     this.p5.noStroke();
        //     this.p5.fill(255, 200);
        //     this.p5.text(int(this.age), 10, 0);
        // }

        this.p5.rotate(theta);
        this.p5.fill(col);
        this.p5.strokeWeight(1);
        this.p5.stroke(col);
        this.p5.beginShape();
        this.p5.vertex(0, -this.r);
        this.p5.vertex(-this.r / 2, this.r);
        this.p5.vertex(this.r / 2, this.r);
        this.p5.endShape(this.p5.CLOSE);

        this.p5.pop();

        this.p5.noFill();
        this.p5.stroke(255);
    }
}
