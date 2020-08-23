

class Graph {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.adjacencyList = {};
        this.createAdjacencyList();
    }

    getNodes() {
        return this.nodes;
    }

    getEdges() {
        return this.edges;
    }

    getNodeByNumber(nodeNumber) {
        for (let i of this.nodes) {
            if (i.number == nodeNumber) {
                return i;
            }
        } 
        return null;
    }

    adj(nodeNumber) {
        if (this.adjacencyList[nodeNumber] != undefined) {
            return this.adjacencyList[nodeNumber];
        }
    }

    createAdjacencyList() {
        for( let node of this.nodes) {
            let adjacentNodes = [];
            for (let edge of this.edges) {
                if (node.number == edge.startingNode.number) {
                    adjacentNodes.push(edge.endingNode);
                } else if (node.number == edge.endingNode.number) {
                    adjacentNodes.push(edge.startingNode);
                }
            }
            this.adjacencyList[node.number] = adjacentNodes;
        } 
    }

    printEdgeList() {
        for (let i of this.edges) {
            console.log(i.startingNode.number, i.endingNode.number);
        }
    }

    printNodes() {
        for (let i of this.nodes) {
            console.log(i.number);
        }
    }

    printAdjacencyList() {
        for (let node in this.adjacencyList) {
            let printArray = [];
            for (let adjacentNode of this.adjacencyList[node]) {
                printArray.push(adjacentNode.number);
            }
            console.log(node, printArray);
        }
    }
}