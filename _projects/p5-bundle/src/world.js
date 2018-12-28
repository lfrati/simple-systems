import { QuadTree, Rectangle, Point, Circle } from './quadtree';
import LinkedList from './linkedlist';

export default class World {
    constructor(p5, height, width, foodAmount, foodBuffer, foodRadius) {
        this.p5 = p5;
        this.height = height;
        this.width = width;
        // How big is the food?
        this.foodRadius = foodRadius;
        // How much food should there?
        this.foodAmount = foodAmount;
        // Don't put food near the edge
        this.foodBuffer = foodBuffer;
        this.foodGrowthRate = 1;
        this.treeCapacity = 5;

        this.boundary = new Rectangle(
            this.width / 2,
            this.height / 2,
            this.width / 2,
            this.height / 2
        );
        this.foodQuadtree = new QuadTree(this.boundary, this.treeCapacity);
        this.foodLinkedList = new LinkedList();
        this.agentsQuadtree = new QuadTree(this.boundary, this.treeCapacity);
        this.agents = [];

        for (let i = 0; i < this.foodAmount; i++) {
            this.growFood(false);
        }
    }

    growFood() {
        // if (circle) {
        //     let theta = ((epoch % 200) * TWO_PI) / 200;
        //     let r = 200;
        //     // Parametric formula for circle
        //     let x = width / 2 + r * cos(theta);
        //     let y = height / 2 + r * sin(theta);
        //     let tmp = createVector(x, y);
        //     this.storeFood(tmp);
        // } else {
        for (let i = 0; i < this.foodGrowthRate; i++) {
            if (this.foodLinkedList.length < this.foodAmount) {
                let x = this.p5.random(this.foodBuffer, this.width - this.foodBuffer);
                let y = this.p5.random(this.foodBuffer, this.height - this.foodBuffer);
                let newFood = this.p5.createVector(x, y);
                this.storeFood(newFood);
            }
        }
    }

    newEpoch() {
        let update = this.agents.reduce(
            (pop, agent) => {
                let { alive, dead } = agent.act();
                pop.alive = pop.alive.concat(alive);
                pop.dead = pop.dead.concat(dead);
                return pop;
            },
            { alive: [], dead: [] }
        );

        this.agents = update.alive;
        // Agents move so the tree is rebuild at each iteration
        this.agentsQuadtree.clear();

        update.alive.forEach(newAgent => {
            let point = new Point(newAgent.position.x, newAgent.position.y, newAgent);
            this.agentsQuadtree.insert(point);
        });

        update.dead.forEach(deadAgent => {
            deadAgent.brain.die();
        });
    }

    saveState() {
        let state = this.agents.reduce((state, agent) => {
            state.push(agent.toJSON());
            return state;
        }, []);
        return state;
    }

    storeFood(vect) {
        // Use linkedlist for sequential access
        let node = this.foodLinkedList.insert(vect);
        // Store the node at coordinates (x,y) using the quadtree
        let point = new Point(vect.x, vect.y, node);
        this.foodQuadtree.insert(point);
    }

    consumeFood(point) {
        this.foodQuadtree.remove(point);
        this.foodLinkedList.remove(point.data);
    }

    clearFood() {
        let toRemove = this.foodQuadtree.query(this.boundary);
        console.log(toRemove);
        for (let point of toRemove) {
            this.foodQuadtree.remove(point);
            this.foodLinkedList.remove(point.data);
        }
    }

    searchFood(agentPos, radius) {
        let range = new Circle(agentPos.x, agentPos.y, radius);
        return this.foodQuadtree.query(range);
    }

    countFood() {
        return this.foodLinkedList.length;
    }

    displayFood() {
        let points = this.foodLinkedList.getAll();
        for (let point of points) {
            this.p5.fill(100, 255, 100, 200);
            this.p5.stroke(100, 255, 100);
            this.p5.ellipse(point.x, point.y, this.foodRadius);
        }
    }
}
