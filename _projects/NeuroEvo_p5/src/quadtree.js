// QuadTree

class Point {
    constructor(x, y, data) {
        this.x = x;
        this.y = y;
        this.data = data;
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point) {
        return (
            point.x >= this.x - this.w &&
            point.x < this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y < this.y + this.h
        );
    }

    intersects(range) {
        return !(
            range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h
        );
    }
}

// circle class for a circle shaped query
class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.rSquared = this.r * this.r;
    }

    contains(point) {
        // check if the point is in the circle by checking if the euclidean distance of
        // the point and the center of the circle if smaller or equal to the radius of
        // the circle
        let d = Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2);
        return d <= this.rSquared;
    }

    intersects(range) {
        let xDist = Math.abs(range.x - this.x);
        let yDist = Math.abs(range.y - this.y);

        // radius of the circle
        let r = this.r;

        let w = range.w;
        let h = range.h;

        let edges = Math.pow(xDist - w, 2) + Math.pow(yDist - h, 2);

        // no intersection
        if (xDist > r + w || yDist > r + h) return false;

        // intersection within the circle
        if (xDist <= w || yDist <= h) return true;

        // intersection on the edge of the circle
        return edges <= this.rSquared;
    }
}

class QuadTree {
    constructor(boundary, capacity) {
        if (!boundary) {
            throw TypeError('boundary is null or undefined');
        }
        if (!(boundary instanceof Rectangle)) {
            throw TypeError('boundary should be a Rectangle');
        }
        if (typeof capacity !== 'number') {
            throw TypeError(`capacity should be a number but is a ${typeof capacity}`);
        }
        if (capacity < 1) {
            throw RangeError('capacity must be greater than 0');
        }

        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    split() {
        // The new centers are going to be computed from the old one
        let x = this.boundary.x;
        let y = this.boundary.y;

        // Each new quad is going to be half the width and the height
        let w = this.boundary.w / 2;
        let h = this.boundary.h / 2;

        let ne = new Rectangle(x + w, y - h, w, h);
        let nw = new Rectangle(x - w, y - h, w, h);
        let se = new Rectangle(x + w, y + h, w, h);
        let sw = new Rectangle(x - w, y + h, w, h);

        this.children = [];
        this.children.push(new QuadTree(ne, this.capacity));
        this.children.push(new QuadTree(nw, this.capacity));
        this.children.push(new QuadTree(se, this.capacity));
        this.children.push(new QuadTree(sw, this.capacity));

        this.divided = true;

        // Distribute the points in the current quad among the 4 new quads
        for (let point of this.points) {
            this.children.reduce((success, child) => {
                if (!success) return child.insert(point);
                return success;
            }, false);
        }
        this.points = [];
    }

    insert(point) {
        // Check if the desired point is contained in the quad
        if (!this.boundary.contains(point)) {
            return false;
        }

        // Prevent infinite recursion if multiple points have the same coords
        if (this.boundary.w < 1 || this.boundary.h < 1) {
            this.points.push(point);
            return true;
        }

        // Check if we are in a leaf
        if (!this.divided) {
            // If there is enough space left insert the point in the current quad
            if (this.points.length < this.capacity) {
                this.points.push(point);
                return true;
            } else {
                // Quad is full, split
                this.split();
            }
        }

        // After splitting the point needs to be inserted in the children
        return this.children.reduce((success, child) => {
            if (!success) return child.insert(point);
            return success;
        }, false);
    }

    // Return all the points in the range
    query(range) {
        // If the range doesn't intersect the current quad boundaries there are no points to be returned
        if (!range.intersects(this.boundary)) {
            return [];
        }
        if (this.divided) {
            // If range intersects but quad is divided search in the children
            return this.children.reduce((points, child) => points.concat(child.query(range)), []);
        }
        // If range intersects and there are no children check the current quad
        else return this.points.filter(point => range.contains(point));
    }

    // Used to merge sectors after removal to avoid keeping superfluous quads
    merge() {
        // Consider merging only if all the children quads are leaves
        if (this.children.every(child => child.divided === false)) {
            // Collects points from the immediate children
            let pts = this.children.reduce((points, child) => points.concat(child.points), []);
            if (pts.length <= this.capacity) {
                this.points = pts;
                this.divided = false;
                this.children = [];
            }
        }
    }

    // Used to remove a specific point from the quad
    remove(point) {
        if (this.divided) {
            // If there are children then perform the removal on them
            this.children.forEach(child => {
                child.remove(point);
            });
            // Check if quads can be merged, being placed here is performed recursively from inner to outer quads
            this.merge();
        }

        // There are no children so check the current quad
        if (this.boundary.contains(point)) {
            // Filter the points that coincide with the target to remove
            this.points = this.points.filter(p => p.x !== point.x || p.y !== point.y);
        }
    }

    clear() {
        this.children = [];
        this.points = [];
        this.divided = false;
    }

    displayQuads() {
        stroke(255);
        noFill();
        rectMode(CENTER);
        rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
        if (this.divided) {
            this.children.forEach(child => child.displayQuads());
        }
    }
}

if (typeof module !== 'undefined') {
    module.exports = {
        Point,
        Rectangle,
        Circle,
        QuadTree
    };
}
