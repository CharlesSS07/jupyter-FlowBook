
class NodeType {

  constructor(title, cell) {
    this.cell = cell; // cell to display, function to run on
    this.title = title; // title of this cell
    if (this.title==null) {
      this.title = FuncSpace.newName();
      this.named = false;
    }
  }

  setTitle(title) {
    if (FuncSpace.funcs.includes(title)) {
      const newname = this.setTitle(title+".copy");
      FuncSpace.funcs.push(newname);
      return newname;
    }
    this.title = title;
    this.named = true;
    FuncSpace.funcs.push(this.title);
    return this.title;
  }

  getTitle() {
    return this.title;
  }

  getCell() {
    return this.cell;
  }

}
