
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

  /**
  * set the title of this type
  * */
  setTitle(title) {
    // if title is unchanged, return the title
    var originalTitle = this.getTitle();
    if (originalTitle==title) {
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

  /**
  * get the title of this type
  * */
  getTitle() {
    return this.title;
  }

  /**
  * get the code for this type
  * */
  getCode() {
    return this.code;
  }

  /**
  * set the code for this type
  * */
  setCode(code) {
    this.code = code;
  }

  /**
  * get list of paramater names for this type
  * */
  getInputList() {
    return this.inputs;
  }

  /**
  * set the input names for this type
  * */
  setInputNames(pinInputList) {
    var names = [];
    for (var i of pinInputList) {
      names.push(i.getName());
    }
    this.inputs = names;
  }

  /**
  * get list of output names for thsi type
  * */
  getOutputList() {
    return this.outputs;
  }

  /**
  * set the output names for this type
  * */
  setOutputNames(pinOutputList) {
    var names = [];
    for (var i of pinOutputList) {
      names.push(i.getName());
    }
    this.outputs = names;
  }

}
