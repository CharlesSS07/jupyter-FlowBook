
class NodePinOutput extends NodePinInput {

  static OUTPUT_NODE_TYPE = 'output';

  constructor(parentNode) {
    super(parentNode);
    delete this.sourceOutputVarName;
    this.pythonKernelVariable = null;
    this.inputs = [];
    //console.log('new output initialized');
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
    if (!this.pythonKernelVariable) {
      // console.log('setting', this.pythonKernelVariable)
      this.setOutputVariable(VarSpace.newName());
    }
    return this.pythonKernelVariable;
  }

  setOutputVariable(name) {
    this.pythonKernelVariable = name;
    // console.log('set', name, this.pythonKernelVariable, this.getOutputVariable());
    this.inputDiv[0].placeholder = this.pythonKernelVariable;
  }

  getType() {
    return NodePinOutput.OUTPUT_NODE_TYPE;
  }

  onSerialize() {
    var inputNode = super.onSerialize(this);
    var obj = {};
    obj.inputNode = inputNode;
    obj.pythonKernelVariable = this.getOutputVariable();
    return JSON.stringify(obj);
  }

  onDeserialize(string) {
    var obj = JSON.parse(string);
    super.onDeserialize(obj.inputNode);
    if (!obj) {
      return this;
    }
    this.setOutputVariable(obj.pythonKernelVariable);
    return this;
  }

}
