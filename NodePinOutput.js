
class NodePinOutput extends NodePinInput {

  static OUTPUT_NODE_TYPE = 'output';

  constructor(parentNode) {
    super(parentNode);
    delete this.sourceOutput;
    this.pythonKernelVariable = VarSpace.newName();
    this.inputs = [];
  }

  addInput(input) {
    this.inputs.push(input);
  }

  removeInput(input) {
    if (this.inputs.include(input)) {
      this.inputs.splice(this.inputs.indexOf(input), 1);
    }
  }

  updateWire() {
    for (var i of this.inputs) {
      i.updateWire();
    }
  }

  getOutput() {
    return null;
  }

  setOutput(o) {
    return;
  }

  getOutputVariable() {
    return this.pythonKernelVariable;
  }

  getType() {
    return NodePinOutput.OUTPUT_NODE_TYPE;
  }

}
