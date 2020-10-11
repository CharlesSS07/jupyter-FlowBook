

class Wire {

  constructor(outputPin, inputPin) {
    this.wire = null;
    this.output = outputPin;
    this.input = inputPin;
  }

  getSVGHelper() {
    return this.wire;
  }

  getWireSVG() {
    throw "getWireSVG of Wire has not been implemented."
  }

  getOutput() {
    return this.output;
  }

  getInput() {
    return this.input;
  }

  getInputPosition() {
    throw "getInputPosition of Wire has not been implemented."
  }

  getOutputPosition() {
    throw "getOutputPosition of Wire has not been implemented."
  }

  update() {
    throw "Update of Wire has not been implemented."
  }
}
