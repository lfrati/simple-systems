class LinkedList {
    constructor() {
        this.length = 0;
        this.head = {
            val: null,
            role: 'head',
            prev: null,
            next: null
        };
        this.tail = {
            val: null,
            role: 'tail',
            prev: null,
            next: null
        };

        this.tail.next = this.head;
        this.tail.prev = this.head;
        this.head.next = this.tail;
        this.head.prev = this.tail;
    }

    // Add nodes at the end
    insert(value) {
        const node = {
            val: value,
            role: 'node',
            prev: null,
            next: null
        };

        // Attach the node between the tail sentinel and the node before
        node.prev = this.tail.prev;
        node.next = this.tail;

        // Connect the nodes
        this.tail.prev.next = node;
        this.tail.prev = node;

        this.length++;
        return node;
    }

    // Remove node
    remove(node) {
        let tmp = node.prev.next;
        node.prev.next = node.next;
        node.next.prev = node.prev;
        this.length--;
    }

    getAll() {
        let nodes = [];
        let temp = this.head.next;
        while (temp != this.tail) {
            nodes.push(temp.val);
            temp = temp.next;
        }
        return nodes;
    }

    display() {
        console.log('Printing:');
        let temp = this.head.next;
        while (temp != this.tail) {
            console.log(temp.val);
            temp = temp.next;
        }
        console.log('End.');
    }
}

if (typeof module != 'undefined') {
    module.exports = LinkedList;
}
