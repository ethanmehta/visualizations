// graphCanvas Stuffs
var graphCanvas = new fabric.Canvas('myChart', {
    backgroundColor: 'rgb(232,242,232)',
});
// dataCanvas Stuffs
var dataCanvas = new fabric.Canvas('myChart2', {
    backgroundColor: 'rgb(184, 233, 237)',
});

fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

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
var algorithmMode = false;
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
    if (startPosY > graphCanvas.height) {
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
graphCanvas.on('object:moving', function(e) {
    var p = e.target;
    for (var i = 0; i < p.adjacentEdgesLeaving.length; i++) {
        p.adjacentEdgesLeaving[i].set({ 'x1': p.left, 'y1': p.top });
        p.adjacentEdgesLeaving[i].sendToBack();
    }
    for (var i = 0; i < p.adjacentEdgesArriving.length; i++) {
        p.adjacentEdgesArriving[i].set({'x2': p.left, 'y2': p.top });
        p.adjacentEdgesArriving[i].sendToBack();
    }
    graphCanvas.renderAll();
});
graphCanvas.on("mouse:dblclick", function(e) {
    if (e.target == null) {
        return;
    }
    var p = e.target;
    if (!algorithmMode) {
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
            graphCanvas.add(edge);
            undo.push(edge);
            redo.clear();
            edge.sendToBack();
            edgeStartClicked.adjacentEdgesLeaving.push(edge);
            edgeEndClicked.adjacentEdgesArriving.push(edge);
        }
    } else {
        console.log("Algorithm Mode");
    }
})

// Button clicking
const constructFromText = document.getElementById("fromText");
const addAndDrawNodeInteractive = document.getElementById("addNode");
const addEdgeInteractive = document.getElementById("addEdge");
const drawEdgeInteractive = document.getElementById("drawEdge");
const settingsButton = document.getElementById("settings");
const changeSettingsButton = document.getElementById("updateSettings");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const closeEdgeButton = document.getElementById("closeButton");

// Adding and Drawing Nodes
addAndDrawNodeInteractive.onclick = function() {
    document.getElementById("settingsFormDiv").style.display = "none";
    document.getElementById("selfEdge").style.display = "none";
    document.getElementById("duplicateEdge").style.display = "none";
    document.getElementById("edgeFormDiv").style.display = "none";
    document.getElementById("formDiv").style.display = "none";
    var node = makeNode();
    graphCanvas.add(node);

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
    for (let j = 0; j < nodeSet.size; j++) {
        startingOptions.push(j);
    }
    while(selectStartingNode.options.length) {
        selectStartingNode.options.remove(0);
    }
    
    for (let i = 0; i < startingOptions.length; i++) {
        let opt = startingOptions[i];
        let el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectStartingNode.appendChild(el);
    }

    var selectEndingNode = document.getElementById("endingNodeSelect");
    var endingOptions = [];

    for (let j = 0; j < nodeSet.size; j++) {
        endingOptions.push(j)
    }
    while(selectEndingNode.options.length) {
        selectEndingNode.options.remove(0);
    }
    for (let i = 0; i < endingOptions.length; i++) {
        let opt = endingOptions[i];
        let el = document.createElement("option");
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
    graphCanvas.add(edge);
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

// Settings Button
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

// Change Settings Button
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
    graphCanvas.renderAll();
    
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
      
    graphCanvas.remove(object);
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
        graphCanvas.add(object);
        nodeId += 1;
    } else {
        edgeSet.add(object);
        graphCanvas.add(object);
        object.sendToBack();
        edgeId += 1;
    }
    
    console.log("Undo:", undo)
    console.log("Redo:", redo)
    console.log("Nodes set:", nodeSet);
    console.log("Edges set:", edgeSet);
}

// Choose Algorithms Section
const doneDrawing = document.getElementById("doneDrawing");
const backToDrawing = document.getElementById("backToDrawing");
const runAlgorithm = document.getElementById("runAlgorithm");
const backToChooseAlgorithm = document.getElementById("backToChooseAlgorithm");
var graph = null;

doneDrawing.onclick = function() {
    var x = document.getElementById("chooseAlgorithmToolbar");
    var y = document.getElementById("drawingToolbar");
    algorithmMode = true;
    graph = new Graph(nodeSet, edgeSet);
    x.style.display="block";
    y.style.display="none";
}

backToDrawing.onclick = function() {
    var x = document.getElementById("chooseAlgorithmToolbar");
    var y = document.getElementById("drawingToolbar");
    algorithmMode = false;
    x.style.display="none";
    y.style.display="block";
}

runAlgorithm.onclick = function() {
    var y = document.getElementById("chooseAlgorithmToolbar");
    var algorithmChoosed = document.getElementById("chooseAlgorithm").value;
    console.log(algorithmChoosed);
    if (algorithmChoosed == "Breadth First Search") {
        document.getElementById("bfsToolbar").style.display="block";
        y.style.display="none";
        document.getElementById("bfsBreakdown").style.display="block";
    } else {
        console.log("Please select an algorithm");
    }

    loadStartingNodeOptions();
}

// BFS Section
backToChooseAlgorithm.onclick = function() {
    var x = document.getElementById("chooseAlgorithmToolbar");
    var y = document.getElementById("bfsToolbar");
    var z = document.getElementById("bfsBreakdown");
    x.style.display="block";
    y.style.display="none";
    z.style.display="none";
}

function loadStartingNodeOptions() {
    console.log("loading node options");
    var selectStartingNode = document.getElementById("chooseStartingNode");
    var startingOptions = [];
    for (let j = 0; j < nodeSet.size; j++) {
        startingOptions.push(j);
    }
    while(selectStartingNode.options.length) {
        selectStartingNode.options.remove(0);
    }
    
    for (let i = 0; i < startingOptions.length; i++) {
        let opt = startingOptions[i];
        let el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectStartingNode.appendChild(el);
    }
}

// Utility Functions