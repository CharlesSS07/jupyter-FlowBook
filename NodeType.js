
class NodeType {

  constructor(title, code) {
    this.code = code; // cell to display, function to run on
    this.title = title; // title of this cell
    this.inputs = [];
    this.outputs = [];
    if (this.title==null) {
      this.title = FuncSpace.newName();
      this.named = false;
    }
  }

  setTitle(title) {
    // if title is unchanged, return the title
    var originalTitle = this.getTitle();
    if (originalTitle==title) {
      console.log('type was unchanged');
      return title;
    }
    FuncSpace.removeFunc(originalTitle);
    if (FuncSpace.funcs.includes(title)) {
      return this.setTitle(title+"_copy");
    }
    if (title=="") {
      if (originalTitle=="") {
        return this.setTitle("untitled");
      }
      return this.setTitle(originalTitle);
    }
    this.title = title;
    this.named = true;
    FuncSpace.addFunc(this.title);
    return this.title;
  }

  getTitle() {
    return this.title;
  }

  getCode() {
    return this.code;
  }

  setCode(code) {
    this.code = code;
  }

  getInputList() {
    return this.inputs;
  }

  setInputs(pinInputList) {
    var names = [];
    for (var i of pinInputList) {
      names.push(i.getName());
    }
    this.inputs = names;
  }

  getOutputList() {
    return this.outputs;
  }

  setOutputs(pinOutputList) {
    var names = [];
    for (var i of pinOutputList) {
      names.push(i.getName());
    }
    this.outputs = names;
  }

}
