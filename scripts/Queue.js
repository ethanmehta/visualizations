class Queue {
    constructor() {
        this.data = [];
    }

    enqueue(element) {
        this.data.push(element);
    }

    dequeue() {
        return this.data.shift();
    }

    isEmpty() {
        return (this.data.length === 0);
    }

    peek() {
        if(!this.isEmpty()) {
            return this.data[0];
        }
    }

    clear() {
        this.data = [];
    }

}