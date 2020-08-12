
class NodeManager {

  constructor(background) {
    // background is a jquery element that is the agreed upon background for the nodeManager
    this.backgroundDiv = background;
    this.nodes = [];
    this.types = {};
    this.selectedIn = null;
    this.selectedOut = null;
    //this.selected = [false, false];
    var me = this;
    this.backgroundDiv.on('mouseup', function(e) {
      // on mouse up, cancel the wire if it is being drawn, and pin is over notebook
      //console.log(e.target);
      //console.log(nodeManager.selectedIn, nodeManager.selectedOut);
      if (e.target===me.backgroundDiv[0]) {
        me.onCancelWiring(e);
      }
      //console.log(nodeManager.selectedIn, nodeManager.selectedOut);
    });
  }

  newNode(cell) {
    var type = this.newType(new NodeType(null, cell));
    var newnode = new Node(this, type);
    this.nodes.push(newnode);
    return newnode;
  }

  getNewNodeInstance(type) {
    var newnode = new Node(this, type);
    this.nodes.push(newnode);
    return newnode;
  }

  getNewNodeInstance(cell) {
    return this.getNewNodeInstance(this.getType(cell));
  }

  getNewNodeInstance(title) {
    return this.getNewNodeInstance(this.getType(cell));
  }

  wireNodes(outputNode, inputNode, pinName) {
    output = outputNode.getOutput()
    input = inputNode.getInputs();
    input.wire(output, name);
  }

  newType(type) {
    if (Object.keys(this.types).includes(type)) {
      this.types[type]+= 1;
    } else {
      this.types[type] = 1;
    }
    return type;
  }

  getType(cell) {
    for (var type of Object.keys(this.types)) {
      if (type.getCell()==cell) {
        return type;
      }
    }
    return this.newType(new NodeType(null, cell));
  }

  getType(title) {
    for (var type of Object.keys(this.types)) {
      if (type.getTitle()==title) {
        return type;
      }
    }
    throw "No known NodeType by title "+title;
  }

  getTypes() {
    return this.types;
  }

  onPan(e) {
    //update all nodes wire
    for (node of this.nodes) {
      node.updateWires();
    }
  }

  onZoom(e) {
    node.updateWires();
  }

  onMoveNode(e, node) {
    node.updateWires();
  }

  getNodes() {
    return this.nodes;
  }

  onCancelWiring(e) {
    //e.preventDefault();
    delete this.selectedIn;
    delete this.selectedOut;
    this.selectedIn = null;
    this.selectedOut = null;
    //this.selected = [false, false];
    //console.log("Wiring Cancelled");
  }

  onPinSelected(pinInput) {
    //run when a pin thinks its been selected
    if (pinInput.getType()==NodePinInput.INPUT_NODE_TYPE) {
      this.selectedIn = pinInput;
      //this.selected[0] = true;
      //console.log('input pin selected', this.selectedIn);
    } else if (pinInput.getType()==NodePinOutput.OUTPUT_NODE_TYPE) {
      this.selectedOut = pinInput;
      //this.selected[1] = true;
      //console.log('output pin selected', this.selectedOut);
    }
    //console.log("Attempting to wire", this.selectedIn, this.selectedOut);
    var inNonNull = Boolean(this.selectedIn); // false when null, true when nonnull
    var outNonNull = Boolean(this.selectedOut);
    //console.log("Decision criteria:", inNonNull, outNonNull, inNonNull && outNonNull);
    if (inNonNull && outNonNull) {
      this.selectedIn.setOutput(this.selectedOut);
      //console.log("Wired:",this.selectedIn, this.selectedOut);
      delete this.selectedIn;
      delete this.selectedOut;
      this.selectedIn = null;
      this.selectedOut = null;
      //this.selected = [false, false];
    }
  }

  getNodeIndex(node) {
    return this.nodes.indexOf(node);
  }

}
