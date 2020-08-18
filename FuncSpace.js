
class FuncSpace {
  static c = FuncSpace.getFuncid();
  static global_space_var = "FuncSpace";
  static funcs = FuncSpace.getFuncs();
  static newName() {
    FuncSpace.c+=1;
    name = FuncSpace.global_space_var+"_func_"+FuncSpace.c; // get the variable contained by the nodespace variable on the python side
    FuncSpace.funcs.push(name);
    return name
  }

  static getFuncid() {
    if (Jupyter.notebook.metadata.nodes.funcid) return Jupyter.notebook.metadata.nodes.funcid;
    return 0;
  }

  static getFuncs() {
    if (Jupyter.notebook.metadata.nodes.funcs) return Jupyter.notebook.metadata.nodes.funcs;
    return [];
  }

  static addFunc(func) {
    if (!FuncSpace.funcs.includes(func)) {
      FuncSpace.funcs.push(func);
    }
  }

  static removeFunc(func) {
    if (!FuncSpace.funcs.includes(func)) {
      FuncSpace.funcs.splice(FuncSpace.funcs.indexOf(func), 1);
    }
  }

}
