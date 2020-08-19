
class NodeManager {

  constructor(background) { // not using background
    // background is a jquery element that is the agreed upon background for the nodeManager
    this.backgroundDiv = background;
    this.nodes = [];
    this.types = [];
    this.selectedIn = null;
    this.selectedOut = null;
    var me = this;
    this.backgroundDiv.on('mouseup', function(e) {
      // on mouse up, cancel the wire if it is being drawn, and mouse is over notebook
      if (e.target===me.backgroundDiv[0]) {
        me.onCancelWiring(e);
      }
    });
  }

  newNode(cell) {
    var type = this.newType(new NodeType(null, cell.get_text()));
    var newnode = new Node(this, type, cell);
    newnode.addOutputPin(new NodePinOutput(this));
    this.nodes.push(newnode);
    return newnode;
  }

  loadNode(cell) {
    // note that the cell currently contains all the nodes data, which is wrong since the function should not be specific to the inputs and outputs of a cell.
    var newnode = new Node(this, null, cell);
    this.nodes.push(newnode);
    newnode.onDeserialize(cell.metadata.nodes);
    return newnode;
  }

  postLoad() {
    this.updateNodeWires();
  }

  // getNewNodeInstance(type, cell) {
  //   var newnode = new Node(this, type, cell);
  //   this.nodes.push(newnode);
  //   return newnode;
  // }
  //
  // getNewNodeInstance(title, cell) {
  //   return this.getNewNodeInstance(this.getType(title));
  // }

  // wireNodes(outputNode, inputNode, pinName) {
  //   output = outputNode.getOutput()
  //   input = inputNode.getInputs();
  //   input.wire(output, name);
  // }

  updateNodeWires() {
    for (var node of this.getNodes()) {
      node.updateWires();
    }
  }

  // refreshAllNodesMetadata() {
  //   for (var n of this.getNodes()) {
  //     n.onSavingNode();
  //   }
  // }

  getOutputByVarName(name) {
    if (!name) {
      return null;
    }
    for (var n of this.getNodes()) {
      for (var o of n.getOutputs()) {
        //console.log('testing', o);
        if (o.getOutputVariable()==name) {
          return o;
        }
      }
    }
    return null;
  }

  newType(type) {
    if (!this.getTypes().includes(type)) {
      this.types.push(type);
    }
    this.consolidateTypes();
    return type;
  }

  getType(title, code) {
    for (var t of this.getTypes()) {
      if (t.getTitle()==title) {
        return t;
      }
    }
    return this.newType(new NodeType(title, code));
  }

  consolidateTypes() {
    var types = this.getTypes();
    var duplicatesFound = false;
    for (var i of types) {
      for (var j of types) {
        if (i.getTitle()==j.getTitle() && i!=j) {
          j.setTitle(j.getTitle()+'_1');
          i.setTitle(i.getTitle()+'_2');
          duplicatesFound = true;
        }
      }
    }
    if (duplicatesFound) {
      for (var n of this.getNodes()) {
        n.updateTitle();
      }
    }
  }

  getTypes() {
    return this.types;
  }

  // onPan(e) {
  //   //update all nodes wire
  //   for (var node of this.getNodes()) {
  //     node.updateWires();
  //   }
  // }
  //
  // onZoom(e) {
  //   node.updateWires();
  // }
  //
  // onMoveNode(e, node) {
  //   node.updateWires();
  // }

  getNodes() {
    return this.nodes;
  }

  onCancelWiring(e) {
    delete this.selectedIn;
    delete this.selectedOut;
    this.selectedIn = null;
    this.selectedOut = null;
  }

  onPinSelected(pinInput) {
    //run when a pin thinks its been selected
    if (pinInput.getType()==NodePinInput.INPUT_NODE_TYPE) {
      this.selectedIn = pinInput;
    } else if (pinInput.getType()==NodePinOutput.OUTPUT_NODE_TYPE) {
      this.selectedOut = pinInput;
    }
    var inNonNull = Boolean(this.selectedIn); // false when null, true when nonnull
    var outNonNull = Boolean(this.selectedOut);
    if (inNonNull && outNonNull) {
      this.selectedIn.setOutput(this.selectedOut);
      delete this.selectedIn;
      delete this.selectedOut;
      this.selectedIn = null;
      this.selectedOut = null;
    }
  }

  // getNodeIndex(node) {
  //   return this.nodes.indexOf(node);
  // }

}
