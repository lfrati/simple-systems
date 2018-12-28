import P5 from 'p5';

// This is a class for an individual sensor
// Each vehicle will have N sensors
class Sensor {
    constructor(angle) {
        this.angle = angle;
        // The vector describes the sensor's direction
        this.dir = P5.Vector.fromAngle(angle);
        // This is the sensor's reading
        this.val = 0;
    }
}

export default class Eyes {
    constructor(p5, world, totalSensors, sensorLength) {
        this.p5 = p5;
        this.world = world;
        // How many sensors does each vehicle have?
        this.totalSensors = totalSensors;
        // How far can each vehicle see?
        this.sensorLength = sensorLength;
        // What's the angle in between sensors
        this.sensorAngle = (Math.PI * 2) / totalSensors;

        // Create an array of sensors
        this.sensors = [];
        for (let angle = 0; angle < this.p5.TWO_PI; angle += this.sensorAngle) {
            this.sensors.push(new Sensor(angle));
        }
    }

    // Function to calculate all sensor readings
    sense(agentPos) {
        // Reset sensors readings to zero
        this.sensors.forEach(sensor => (sensor.val = 0));
        // Search for food within the sensor distance
        let foods = this.world.searchFood(agentPos, this.sensorLength);
        for (let food of foods) {
            // Where is the food
            let otherPosition = food.data.val;
            // Vector pointing to food
            let toFood = P5.Vector.sub(otherPosition, agentPos);
            this.querySensors(toFood);
        }
        // Normalize readings
        let totReading = this.sensors.reduce((sum, sensor) => sum + sensor.val, 0);

        let sensorReadings = this.sensors.reduce((acc, sensor) => {
            if (totReading > 0) sensor.val /= totReading;
            acc.push(sensor.val);
            return acc;
        }, []);

        return sensorReadings;
    }

    querySensors(vectorToFood) {
        let closeness = this.sensorLength - vectorToFood.mag();
        // Check all the sensors
        for (let sensor of this.sensors) {
            // If the relative angle of the food is in between the range
            let delta = sensor.dir.angleBetween(vectorToFood);
            if (delta < this.sensorAngle / 2) {
                // Increase the activation of the sensor based on how much food it senses
                sensor.val += closeness;
            }
        }
    }

    display() {
        this.p5.noFill();
        this.p5.stroke(255);
        //ellipse(0, 0, this.sensorLength * 2);
        let radius = this.sensorLength * 2;
        this.sensors.forEach(sensor => {
            let currAngle = sensor.angle;
            let from = currAngle - this.sensorAngle / 2;
            let to = currAngle + this.sensorAngle / 2;
            this.p5.stroke(50);
            this.p5.arc(0, 0, radius, radius, from, to, PIE);
        });
        // Draw lines for all the activated sensors
        for (let sensor of this.sensors) {
            let val = map(sensor.val, 0, 1, 0, this.sensorLength);
            if (val > 0) {
                this.p5.stroke(255);
                this.p5.line(0, 0, sensor.dir.x * val, sensor.dir.y * val);
            }
        }
    }
}
