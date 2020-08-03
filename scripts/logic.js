// Necessary DataStructures
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

// Canvas Stuffs
var canvas = new fabric.Canvas('myChart', {
    backgroundColor: 'rgb(232,242,232)',
});
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

// Global Variables
var nodeSet = new Set();
var edgeSet = new Set();
var undo = new Stack();
var redo = new Stack();

var nodeId = 0;
var edgeId = 0;
var startPosX = 50;
var startPosY = 50;
var nodeColor = '#fff';
var edgeColor = "red";

var edgeStartClicked = null;
var edgeStartClickedSelected = false;

var edgeEndClicked = null;
var edgeEndClickedSelected = false;

// Drawing and Object Construction Functions
function makeNode() {
    var circle = new fabric.Circle({
        left: startPosX,
        top: startPosY,
        strokeWidth: 5,
        radius: 20,
        fill: nodeColor,
        stroke: '#000'
    });
    
    var number = nodeId;

    var text = new fabric.Text(number.toString(), {
        fontSize: 20,
        left: circle.left,
        top: circle.top,
        selectable: false
    });

    var node = new fabric.Group([circle, text], {
        left: circle.left,
        top: circle.top
    });
    node.circle = circle;
    node.text = text;

    startPosX += 5;
    startPosY += 5;
    if (startPosY > canvas.height) {
        startPosX = 55;
        startPosY = 50;
    }

    node.number = nodeId;
    nodeId += 1;

    node.hasControls = node.hasBorders = false;
  
    node.adjacentEdgesLeaving = [];
    node.adjacentEdgesArriving = [];

    return node;
}
function makeLine(startingNode, endingNode) {
    var edge = new fabric.Line([startingNode.left, startingNode.top, endingNode.left, endingNode.top], {
        fill: edgeColor,
        stroke: edgeColor,
        strokeWidth: 5,
        selectable: false,
        evented: false,
      });
    edge.startingNode = startingNode;
    edge.endingNode = endingNode;
    edge.id = edgeId;
    edgeId += 1;
    return edge
}
function changeNodeColor(node, color) {
    node.item(0).set({
        'fill': color,
    });
}
function changeEdgeColor(edge, color) {
    edge.set({
        'stroke': color,
        'fill': color
    });
}
canvas.on('object:moving', function(e) {
    var p = e.target;
    for (var i = 0; i < p.adjacentEdgesLeaving.length; i++) {
        p.adjacentEdgesLeaving[i].set({ 'x1': p.left, 'y1': p.top });
        p.adjacentEdgesLeaving[i].sendToBack();
    }
    for (var i = 0; i < p.adjacentEdgesArriving.length; i++) {
        p.adjacentEdgesArriving[i].set({'x2': p.left, 'y2': p.top });
        p.adjacentEdgesArriving[i].sendToBack();
    }
    canvas.renderAll();
});

canvas.on("mouse:dblclick", function(e) {
    if (e.target == null) {
        return;
    }
    var p = e.target;
    console.log("Selected:", p);

    if (!edgeStartClickedSelected) {
        edgeStartClicked = p;
        edgeStartClickedSelected = true;
    } else if (!edgeEndClickedSelected && edgeStartClickedSelected) {
        edgeEndClicked = p;
        edgeEndClickedSelected = true;
    }
    if (edgeStartClickedSelected && edgeEndClickedSelected) {
        edgeStartClickedSelected = false;
        edgeEndClickedSelected = false;

        var startingNodeIndex = edgeStartClicked.number;
        var endingNodeIndex = edgeEndClicked.number;

        if (startingNodeIndex == endingNodeIndex) {
            console.log("no self edges");
            return;
        }
    
        var startingNode = null;
        var endingNode = null;
    
        for (let item of nodeSet.keys()) {
            if (item.number.toString() == startingNodeIndex) {
                startingNode = item;
            }
            if (item.number.toString() == endingNodeIndex) {
                endingNode = item;
            }
        }
        
        for (let item of edgeSet.keys()) {
            if ((item.startingNode.number == parseInt(startingNodeIndex, 10) && item.endingNode.number == parseInt(endingNodeIndex, 10)) || (item.endingNode.number == parseInt(startingNodeIndex, 10) && item.startingNode.number == parseInt(endingNodeIndex, 10)))  {
                console.log("no duplicate edges");
                return;
            }
        }
        
        
        var edge = makeLine(startingNode, endingNode);
        edgeSet.add(edge)
        canvas.add(edge);
        undo.push(edge);
        redo.clear();
        edge.sendToBack();
        edgeStartClicked.adjacentEdgesLeaving.push(edge);
        edgeEndClicked.adjacentEdgesArriving.push(edge);
    }
})

// Button clicking
var constructFromText = document.getElementById("fromText");
var addAndDrawNodeInteractive = document.getElementById("addNode");
var addEdgeInteractive = document.getElementById("addEdge");
var drawEdgeInteractive = document.getElementById("drawEdge");
var settingsButton = document.getElementById("settings");
var changeSettingsButton = document.getElementById("updateSettings");
var undoButton = document.getElementById("undoButton");
var redoButton = document.getElementById("redoButton");
var closeEdgeButton = document.getElementById("closeButton");

// Adding and Drawing Nodes
addAndDrawNodeInteractive.onclick = function() {
    document.getElementById("settingsFormDiv").style.display = "none";
    document.getElementById("selfEdge").style.display = "none";
    document.getElementById("duplicateEdge").style.display = "none";
    document.getElementById("edgeFormDiv").style.display = "none";
    document.getElementById("formDiv").style.display = "none";
    var node = makeNode();
    canvas.add(node);

    nodeSet.add(node);
    undo.push(node);
    redo.clear();
    console.log("Undo:", undo)
    console.log("Redo:", redo)
    console.log("Nodes set:", nodeSet);
    console.log("Edges set:", edgeSet);
}
// Adding Edges
addEdgeInteractive.onclick = function() {
    document.getElementById("settingsFormDiv").style.display = "none";
    document.getElementById("selfEdge").style.display = "none";
    document.getElementById("duplicateEdge").style.display = "none";
    var x = document.getElementById("edgeFormDiv");
    document.getElementById("formDiv").style.display = "none";

    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }

    var selectStartingNode = document.getElementById("startingNodeSelect");
    var startingOptions = [];
    for (var j = 0; j < nodeSet.size; j++) {
        startingOptions.push(j);
    }
    while(selectStartingNode.options.length) {
        selectStartingNode.options.remove(0);
    }
    
    for (var i = 0; i < startingOptions.length; i++) {
        var opt = startingOptions[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectStartingNode.appendChild(el);
    }

    var selectEndingNode = document.getElementById("endingNodeSelect");
    var endingOptions = [];

    for (var j = 0; j < nodeSet.size; j++) {
        endingOptions.push(j)
    }
    while(selectEndingNode.options.length) {
        selectEndingNode.options.remove(0);
    }
    for (var i = 0; i < endingOptions.length; i++) {
        var opt = endingOptions[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectEndingNode.appendChild(el);
    }
    console.log("Undo:", undo)
    console.log("Redo:", redo)
    console.log("Nodes set:", nodeSet);
    console.log("Edges set:", edgeSet);
}
// Drawing Edges
drawEdgeInteractive.onclick = function() {
    document.getElementById("settingsFormDiv").style.display = "none";
    document.getElementById("selfEdge").style.display = "none";
    document.getElementById("duplicateEdge").style.display = "none";
    var startingNodeIndex = document.getElementById("startingNodeSelect").value;
    var endingNodeIndex = document.getElementById("endingNodeSelect").value;
    if (startingNodeIndex == endingNodeIndex) {
        document.getElementById("selfEdge").style.display = "block";
        return;
    }

    var startingNode = null;
    var endingNode = null;

    for (let item of nodeSet.keys()) {
        if (item.number.toString() == startingNodeIndex) {
            startingNode = item;
        }
        if (item.number.toString() == endingNodeIndex) {
            endingNode = item;
        }
    }
    
    for (let item of edgeSet.keys()) {
        if ((item.startingNode.number == parseInt(startingNodeIndex, 10) && item.endingNode.number == parseInt(endingNodeIndex, 10)) || (item.endingNode.number == parseInt(startingNodeIndex, 10) && item.startingNode.number == parseInt(endingNodeIndex, 10)))  {
            document.getElementById("duplicateEdge").style.display = "block";
            return;
        }
    }
    
    
    var edge = makeLine(startingNode, endingNode);
    edgeSet.add(edge)
    canvas.add(edge);
    edge.sendToBack();
    startingNode.adjacentEdgesLeaving.push(edge);
    endingNode.adjacentEdgesArriving.push(edge);

    document.getElementById("edgeFormDiv").style.display = "none";
    document.getElementById("selfEdge").style.display = "none";
    document.getElementById("duplicateEdge").style.display = "none";

    undo.push(edge);
    redo.clear();

    console.log("Undo:", undo)
    console.log("Redo:", redo)
    console.log("Nodes set:", nodeSet);
    console.log("Edges set:", edgeSet);
}

// Close Button for Add Edge Form
closeEdgeButton.onclick = function() {
    document.getElementById("edgeFormDiv").style.display = "none";
}
// Settings
settingsButton.onclick = function() {
    document.getElementById("selfEdge").style.display = "none";
    document.getElementById("duplicateEdge").style.display = "none";
    document.getElementById("edgeFormDiv").style.display = "none";
    var x = document.getElementById("settingsFormDiv");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
changeSettingsButton.onclick = function() {
    document.getElementById("selfEdge").style.display = "none";
    document.getElementById("duplicateEdge").style.display = "none";
    document.getElementById("edgeFormDiv").style.display = "none";
    
    
    edgeColor = document.getElementById("edgeColor").value;
    nodeColor = document.getElementById("nodeColor").value;

    for(let node of nodeSet){
       changeNodeColor(node, nodeColor);
    }

    for(let edge of edgeSet){
        changeEdgeColor(edge, edgeColor);
    }
    canvas.renderAll();
    
    document.getElementById("settingsFormDiv").style.display = "none";
}
// Undo Option
undoButton.onclick = function() {
    document.getElementById("settingsFormDiv").style.display = "none";
    document.getElementById("selfEdge").style.display = "none";
    document.getElementById("duplicateEdge").style.display = "none";
    if (undo.isEmpty()) {
        console.log("Nothing to undo.")
        return;
    }
    var object = undo.pop();
    redo.push(object);
    if (object.number != null) {
        nodeSet.forEach(node => node.number === object.number ? nodeSet.delete(node) : node);
        nodeId -= 1;
    } else {
        edgeSet.forEach(edge => edge.id === object.id ? edgeSet.delete(edge) : edge);
        edgeId -= 1;
    }
      
    canvas.remove(object);
    console.log("Undo:", undo)
    console.log("Redo:", redo)
    console.log("Nodes set:", nodeSet);
    console.log("Edges set:", edgeSet);
}
// Redo Option
redoButton.onclick = function() {
    document.getElementById("settingsFormDiv").style.display = "none";
    document.getElementById("selfEdge").style.display = "none";
    document.getElementById("duplicateEdge").style.display = "none";
    if (redo.isEmpty()) {
        console.log("Nothing to redo.")
        return;
    }
    var object = redo.pop();
    undo.push(object);
    
    if (object.number != null) {
        nodeSet.add(object);
        canvas.add(object);
        nodeId += 1;
    } else {
        edgeSet.add(object);
        canvas.add(object);
        object.sendToBack();
        edgeId += 1;
    }
    

    console.log("Undo:", undo)
    console.log("Redo:", redo)
    console.log("Nodes set:", nodeSet);
    console.log("Edges set:", edgeSet);
}


// Algorithms Section
var algorithmSelectionButton = document.getElementById("algorithmSelection");
var algorithm = document.getElementById("algorithm").value;

algorithmSelectionButton.onclick = function() {
    if (algorithm === "Breadth First Search") {
        console.log("Choose start node.")
    }
}

// BFS Section







// Under construction Do not venture below yet //
// Constructing Graph from Text Representation
// constructFromText.onclick = function(){
//     document.getElementById("settingsFormDiv").style.display = "none";
//     document.getElementById("selfEdge").style.display = "none";
//     document.getElementById("duplicateEdge").style.display = "none";
//     var x = document.getElementById("formDiv");
//     document.getElementById("edgeFormDiv").style.display = "none";

//     if (x.style.display === "none") {
//         x.style.display = "block";
//     } else {
//         x.style.display = "none";
//     }
// }
// // Construction Graph from Text Representation
// var drawGraph = document.getElementById("drawGraph");
// var data = null;
// drawGraph.onclick = function() {
//     document.getElementById("formDiv").style.display = "none";

//     // Logic
//     var graphRepresentation;
//     if (document.getElementById("adjacencyList").checked) {
//         graphRepresentation = "adjacencyList";
//     } else if (document.getElementById("adjacencyMatrix").checked){
//         graphRepresentation = "adjacencyMatrix";
//     } else {
//         graphRepresentation = "edgeList"
//     }

//     data = document.getElementById("data").value;
    
//     if (graphRepresentation == "adjacencyList") {
//         data = data.split("\n");
//         for (var i = 0; i < data.length; i++) {
//             parsed = [];
//             toParse = data[i].split(", ");
//             for (var j = 0; j < toParse.length; j++) {
//                 parsed.push(+toParse[j]);
//             }
//             data[i] = parsed;
//         }
//         dataFormatted = data;
//     }
    

//     drawGraph(dataFormatted, graphRepresentation)
// }
// /* Drawing Functions */
// function drawGraph(data, graphRepresentation) {
//     // On hold until I can figure out an algorithm to minimize crossing number.
//     // if (graphRepresentation == "adjacencyList") {
        
//     // }
// }


