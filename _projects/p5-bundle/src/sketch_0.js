import Boid from './boid';

// sketch starting point must be a function
export default function align_separ_cohes(p5) {
    const width = 640;
    const height = 360;
    const perception = 200;
    let pointX = (2 * width) / 3;
    let pointY = (2 * height) / 3;
    let clicking = false;
    let test = new Boid(width, height, p5);
    test.position.x = pointX;
    test.position.y = pointY;

    // let others = [
    //     [width / 3 - 11, height / 3],
    //     [width / 3 + 33, height / 3 - 7],
    //     [width / 3, height / 3 - 21],
    //     [width / 3 + 20, height / 3 - 31],
    //     [width / 3 + 20, height / 3 + 31]
    // ];
    let spread = 50;
    let others = [
        [
            p5.random(width / 3 - spread, width / 3 + spread),
            p5.random(height / 3 - spread, height / 3 + spread)
        ],
        [
            p5.random(width / 3 - spread, width / 3 + spread),
            p5.random(height / 3 - spread, height / 3 + spread)
        ],
        [
            p5.random(width / 3 - spread, width / 3 + spread),
            p5.random(height / 3 - spread, height / 3 + spread)
        ],
        [
            p5.random(width / 3 - spread, width / 3 + spread),
            p5.random(height / 3 - spread, height / 3 + spread)
        ],
        [
            p5.random(width / 3 - spread, width / 3 + spread),
            p5.random(height / 3 - spread, height / 3 + spread)
        ]
    ];

    let boids = [];
    for (let position of others) {
        let [x, y] = position;
        let boid = new Boid(width, height, p5);
        boid.position.x = x;
        boid.position.y = y;
        boids.push(boid);
    }
    let neighbours = [];

    function myclick() {
        console.log(others);
        // for (let boid of boids) {
        //     console.log(boid.position);
        // }
    }

    // runs once to set up the canvas
    p5.setup = () => {
        var cnv = p5.createCanvas(width, height);
        cnv.mousePressed(() => {
            clicking = true;
        });
        cnv.mouseReleased(() => {
            clicking = false;
        });

        p5.rectMode(p5.CENTER); // the first two arguments of a rect are now its center point, not corner
        p5.textAlign(p5.CENTER);
        p5.background(50);
        p5.fill(255);
        p5.textSize(40);
        p5.text('CLICK & DRAG', width / 2, height / 2);
    };

    // runs at every frame
    p5.draw = () => {
        if (clicking) {
            pointX = p5.mouseX;
            pointY = p5.mouseY;

            p5.background(50);

            p5.strokeWeight(1);
            p5.fill(255);

            neighbours = [];
            for (let boid of boids) {
                let x = boid.position.x;
                let y = boid.position.y;
                let v_x = boid.velocity.x * 10; // scaling for visibility
                let v_y = boid.velocity.y * 10;

                p5.stroke(100);
                p5.line(x, y, x + v_x, y + v_y);

                if (p5.dist(x, y, pointX, pointY) < perception / 2) {
                    p5.fill('#FF4136'); // orange
                    neighbours.push(boid);
                } else {
                    p5.fill('#7FDBFF'); // aqua
                }

                p5.ellipse(x, y, 10, 10);
            }

            test.position.x = pointX;
            test.position.y = pointY;

            // Boid velocity
            let v_x = test.velocity.x * 10; // scaling for visibility
            let v_y = test.velocity.y * 10;
            p5.stroke(100);
            p5.line(pointX, pointY, pointX + v_x, pointY + v_y);

            let separation = test.separation(neighbours);
            let s_x = separation.x * 200; // scaling for visibility
            let s_y = separation.y * 200;
            p5.stroke('#2ECC40');
            p5.fill('#2ECC40');
            p5.textAlign(p5.RIGHT);
            p5.textSize(15);
            p5.text('SEPARATION', width - 10, 20);
            p5.line(pointX, pointY, pointX + s_x, pointY + s_y);

            let cohesion = test.cohesion(neighbours);
            let c_x = cohesion.x * 200; // scaling for visibility
            let c_y = cohesion.y * 200;
            p5.stroke('#FFDC00');
            p5.fill('#FFDC00');
            p5.textAlign(p5.RIGHT);
            p5.textSize(15);
            p5.text('COHESION', width - 10, 40);
            p5.line(pointX, pointY, pointX + c_x, pointY + c_y);

            let alignment = test.align(neighbours);
            let a_x = alignment.x * 200; // scaling for visibility
            let a_y = alignment.y * 200;
            p5.stroke('#B10DC9');
            p5.fill('#B10DC9');
            p5.textAlign(p5.RIGHT);
            p5.textSize(15);
            p5.text('ALIGNMENT', width - 10, 60);
            p5.line(pointX, pointY, pointX + a_x, pointY + a_y);

            // Boid
            p5.strokeWeight(1);
            p5.fill(255);
            p5.stroke(255);
            p5.ellipse(pointX, pointY, 10, 10);

            // Perception radius
            p5.stroke(150);
            p5.noFill();
            p5.ellipse(pointX, pointY, perception, perception);
        }
    };
}
