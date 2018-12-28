import P5 from 'p5';

// Adapted from
// Flocking
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

export default class Boid {
    constructor(width, height, p5) {
        this.p5 = p5;
        this.width = width;
        this.height = height;
        this.maxForce = 0.2;
        this.maxSpeed = 5;
        this.position = this.p5.createVector(
            this.p5.random(this.width),
            this.p5.random(this.height)
        );
        this.velocity = P5.Vector.random2D(p5);
        this.velocity.setMag(this.p5.random(1, this.maxSpeed));
        this.acceleration = this.p5.createVector();
    }

    edges() {
        if (this.position.x > this.width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = this.width;
        }
        if (this.position.y > this.height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = this.height;
        }
    }

    align(boids) {
        let steering = this.p5.createVector();
        let total = 0;
        for (let other of boids) {
            let d = this.p5.dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );

            steering.add(other.velocity);
            total++;
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(boids) {
        let steering = this.p5.createVector();
        let total = 0;
        for (let other of boids) {
            let d = this.p5.dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );

            let diff = P5.Vector.sub(this.position, other.position);
            diff.div(d * d);
            steering.add(diff);
            total++;
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    cohesion(boids) {
        let steering = this.p5.createVector();
        let total = 0;
        for (let other of boids) {
            let d = this.p5.dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );

            steering.add(other.position);
            total++;
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    flock(boids, align, cohes, separ) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        alignment.mult(align);
        cohesion.mult(cohes);
        separation.mult(separ);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    show() {
        this.p5.strokeWeight(8);
        this.p5.stroke(255);
        this.p5.point(this.position.x, this.position.y);
    }
}
