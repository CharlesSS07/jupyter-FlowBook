
class FuncSpace {
  static c = FuncSpace.getFuncid();
  static global_space_var = "FuncSpace";
  static funcs = FuncSpace.getFuncs();

  /**
  * generates a new name that has not bee used before
  * */
  static newName() {
    FuncSpace.c+=1;
    Jupyter.notebook.metadata.nodes.funcid = FuncSpace.c;
    name = FuncSpace.global_space_var+"_func_"+FuncSpace.c; // get the variable contained by the nodespace variable on the python side
    FuncSpace.funcs.push(name);
    return name
  }

  /**
  * return the currenct funcid so that new names can be generated and not collide with old ones
  * */
  static getFuncid() {
    if (Jupyter.notebook.metadata.nodes && Jupyter.notebook.metadata.nodes.funcid) return Jupyter.notebook.metadata.nodes.funcid;
    return 0;
  }

  /**
  * get a list of allocated functions
  * */
  static getFuncs() {
    if (Jupyter.notebook.metadata.nodes && Jupyter.notebook.metadata.nodes.funcs) return Jupyter.notebook.metadata.nodes.funcs;
    return [];
  }

  /**
  * add a function, and make sure there are no duplicates
  * */
  static addFunc(func) {
    if (!FuncSpace.funcs.includes(func)) {
      FuncSpace.funcs.push(func);
    }
  }

  /**
  * deallocate function
  * */
  static removeFunc(func) {
    if (!FuncSpace.funcs.includes(func)) {
      FuncSpace.funcs.splice(FuncSpace.funcs.indexOf(func), 1);
    }
  }

}
