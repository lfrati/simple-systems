class World {
    constructor(height, width, foodAmount, foodBuffer, foodRadius) {
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

    growFood(circle) {
        if (circle) {
            let theta = ((epoch % 200) * TWO_PI) / 200;
            let r = 200;
            // Parametric formula for circle
            let x = width / 2 + r * cos(theta);
            let y = height / 2 + r * sin(theta);
            let tmp = createVector(x, y);
            world.storeFood(tmp);
        } else {
            for (let i = 0; i < this.foodGrowthRate; i++) {
                if (this.foodLinkedList.length < this.foodAmount) {
                    let x = random(this.foodBuffer, this.width - this.foodBuffer);
                    let y = random(this.foodBuffer, this.height - this.foodBuffer);
                    let newFood = createVector(x, y);
                    this.storeFood(newFood);
                }
            }
        }
    }

    newEpoch() {
        let update = world.agents.reduce(
            (pop, agent) => {
                let { alive, dead } = agent.act(immortal.checked());
                pop.alive = pop.alive.concat(alive);
                pop.dead = pop.dead.concat(dead);
                return pop;
            },
            { alive: [], dead: [] }
        );

        world.agents = update.alive;
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
        let state = world.agents.reduce((state, agent) => {
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

    searchPartners(agentPos, radius) {
        // Search for possible partners, contains the agent itself
        let range = new Circle(agentPos.x, agentPos.y, radius);
        return world.agentsQuadtree.query(range);
    }

    countFood() {
        return this.foodLinkedList.length;
    }

    displayFood() {
        let points = this.foodLinkedList.getAll();
        for (let point of points) {
            fill(100, 255, 100, 200);
            stroke(100, 255, 100);
            ellipse(point.x, point.y, this.foodRadius);
        }
    }
}
