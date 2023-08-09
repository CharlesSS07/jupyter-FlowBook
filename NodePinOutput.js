
class NodePinOutput extends NodePinInput {

  static OUTPUT_NODE_TYPE = 'output';

  constructor(parentNode) {
    super(parentNode);
    delete this.sourceOutputVarName;
    //this.pythonKernelVariable = null;
    this.inputs = [];
  }

  addInput(input) {
    this.inputs.push(input);
  }

  removeInput(input) {
    if (this.inputs.includes(input)) {
      this.inputs.splice(this.inputs.indexOf(input), 1);
    }
  }

  makePin() {
    return super.makePin().addClass('node-output-pin');
  }

  makePinDiv() {
    var div = $('<div>').addClass('node-output');
    div.append(this.getPin());
    div.append(this.getField());
    this.div = div;
    return div;
  }

  updateWire(transform) {
    for (var i of this.inputs) {
      i.updateWire(transform);
    }
  }

  getOutput() {
    return null;
  }

  setOutput(o) {
    return;
  }

  getOutputVariable() {
    if (!this.name) {
      this.setOutputVariable(VarSpace.newName());
    }
    //return this.pythonKernelVariable;
    return this.name
  }

  setOutputVariable(name) {
    this.name = name;
    this.inputDiv[0].placeholder = this.name;
  }

  getType() {
    return NodePinOutput.OUTPUT_NODE_TYPE;
  }

  onSerialize() {
    var inputNode = super.onSerialize(this);
    var obj = {};
    obj.inputNode = inputNode;
    obj.name = this.getOutputVariable();
    return JSON.stringify(obj);
  }

  onDeserialize(string) {
    var obj = JSON.parse(string);
    super.onDeserialize(obj.inputNode);
    if (!obj) {
      return this;
    }
    this.setOutputVariable(obj.name);
    return this;
  }

}
