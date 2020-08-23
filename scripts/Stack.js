class Stack {
    constructor(){
        this.data = [];
        this.first = 0;
    }

    push(element) {
        this.data[this.first] = element;
        this.first = this.first + 1;
    }

    length() {
        return this.first;
    }

    peek() {
        return this.data[this.first - 1];
    }

    isEmpty() {
        return this.first === 0;
    }

    pop() {
        if(!this.isEmpty()) {
           this.first = this.first - 1;
           return this.data.pop(); 
        }
    }

    clear() {
        this.data = [];
        this.first = 0;
    }
}