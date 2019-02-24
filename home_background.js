let flock;
let numBoids = 20;
let aim;

let segNum = 5;
let segLength = 5;

let splatters = [];
let serpent;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', -1);

    flock = new Flock();
    // Add an initial set of boids into the system
    for (let i = 0; i < numBoids; i++) {
        let b = new Boid(width / 2, height / 2);
        flock.addBoid(b);
    }

    startPos = createVector(0, 0);
    serpent = new Serpent();
}

function draw() {
    background(255);
    aim = createVector(mouseX, mouseY);
    flock.run();

    serpent.chase(flock);
    serpent.show();

    for (let particle of splatters) {
        particle.show();
        //particle.update();
    }
}

// Flock object
// Does very little, simply manages the array of all the boids

class Flock {
    constructor() {
        // An array for all the boids
        this.boids = []; // Initialize the array
    }

    closest(pos) {
        let bestBoid = createVector(mouseX, mouseY);
        let bestDist = pos.dist(bestBoid);

        for (let boid of this.boids) {
            let d = pos.dist(boid.position);
            if (d < bestDist) {
                bestDist = d;
                bestBoid = boid.position;
            }
            if (d < 10) {
                boid.dead = true;
                serpent.x.push(0);
                serpent.y.push(0);
                splatters.push(new Splatter(boid.position.x, boid.position.y));
            }
        }
        strokeWeight(1);
        stroke(0, 50);
        line(pos.x, pos.y, bestBoid.x, bestBoid.y);
        return bestBoid;
    }

    run() {
        this.next = [];
        for (let boid of this.boids) {
            boid.run(this.boids); // Passing the entire list of boids to each boid individually
            if (boid.dead == false) {
                this.next.push(boid);
            }
        }
        this.boids = this.next;
    }
    addBoid(b) {
        this.boids.push(b);
    }
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

class Boid {
    constructor(x, y) {
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.position = createVector(x, y);
        this.r = 3.0;
        this.maxspeed = 4; // Maximum speed
        this.maxforce = 0.05; // Maximum steering force
        this.dead = false;
    }

    run(boids) {
        this.flock(boids);
        this.update();
        this.borders();
        this.render();
    }

    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    }

    // We accumulate a new acceleration each time based on three rules
    flock(boids) {
        let chase = this.seek(aim);
        let sep = this.separate(boids);
        // Arbitrarily weight these forces
        chase.mult(1.5);
        sep.mult(1.0);
        // Add the force vectors to acceleration
        this.applyForce(chase);
        this.applyForce(sep);
    }

    // Separation
    // Method checks for nearby boids and steers away
    separate(boids) {
        let desiredseparation = 25.0;
        let steer = createVector(0, 0);
        let count = 0;
        // For every boid in the system, check if it's too close
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.position, boids[i].position);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if (d > 0 && d < desiredseparation) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.position, boids[i].position);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff);
                count++; // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            steer.div(count);
        }

        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
            // Implement Reynolds: Steering = Desired - Velocity
            steer.normalize();
            steer.mult(this.maxspeed);
            steer.sub(this.velocity);
            steer.limit(this.maxforce);
        }
        return steer;
    }

    // Method to update location
    update() {
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        // Reset accelertion to 0 each cycle
        this.acceleration.mult(0);
    }

    // A method that calculates and applies a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    seek(target) {
        let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
        // Normalize desired and scale to maximum speed
        desired.normalize();
        desired.mult(this.maxspeed);
        // Steering = Desired minus Velocity
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce); // Limit to maximum steering force
        return steer;
    }

    render() {
        // Draw a triangle rotated in the direction of velocity
        let theta = this.velocity.heading() + radians(90);
        fill(127);
        stroke(0);
        strokeWeight(1);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
        vertex(0, -this.r * 2);
        vertex(-this.r, this.r * 2);
        vertex(this.r, this.r * 2);
        endShape(CLOSE);
        pop();
    }

    // Wraparound
    borders() {
        if (this.position.x < -this.r) this.position.x = width + this.r;
        if (this.position.y < -this.r) this.position.y = height + this.r;
        if (this.position.x > width + this.r) this.position.x = -this.r;
        if (this.position.y > height + this.r) this.position.y = -this.r;
    }
}

class Serpent extends Boid {
    constructor() {
        super();
        // this.acceleration = createVector(0, 0);
        // this.velocity = createVector(random(-1, 1), random(-1, 1));
        // this.position = createVector(x, y);
        // this.r = 3.0;
        // this.maxspeed = 4; // Maximum speed
        // this.maxforce = 0.05; // Maximum steering force
        this.maxspeed = 2;
        this.maxforce = 0.1;
        this.x = new Array(segNum).fill(0);
        this.y = new Array(segNum).fill(0);
    }

    dragSegment(i, xin, yin) {
        var dx = xin - this.x[i];
        var dy = yin - this.y[i];
        var angle = atan2(dy, dx);
        this.x[i] = xin - cos(angle) * segLength;
        this.y[i] = yin - sin(angle) * segLength;
        this.segment(this.x[i], this.y[i], angle);
    }

    segment(x, y, a) {
        push();
        translate(x, y);
        rotate(a);
        line(0, 0, segLength, 0);
        pop();
    }

    show() {
        strokeWeight(8);
        stroke(0);
        this.dragSegment(0, this.position.x, this.position.y);
        for (var i = 0; i < this.x.length - 1; i++) {
            this.dragSegment(i + 1, this.x[i], this.y[i]);
        }
    }

    chase(flock) {
        let prey = flock.closest(serpent.position);
        //let prey = createVector(mouseX, mouseY);
        let aim = this.seek(prey);
        this.applyForce(aim);
        this.update();
        this.borders();
    }

    // Wraparound
    borders() {
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.y < 0) this.position.y = 0;
        if (this.position.x > width) this.position.x = width;
        if (this.position.y > height) this.position.y = height;
    }
}

class Splatter {
    constructor(x, y) {
        this.life = 1;
        this.decay = 0.01;
        this.x = x;
        this.y = y;
        this.particles = [];
        for (let i = 0; i < 5; i++) {
            let particle = createVector(x + random(10), y + random(10));
            this.particles.push([particle, random(5)]);
        }
    }
    update() {
        if (this.life > 0) {
            this.life -= this.decay;
        }
    }
    show() {
        for (let splatter of this.particles) {
            let particle = splatter[0];
            let size = splatter[1];
            noStroke();
            fill(255, 0, 0, 100 * this.life);
            ellipse(particle.x, particle.y, size, size);
        }
    }
}
