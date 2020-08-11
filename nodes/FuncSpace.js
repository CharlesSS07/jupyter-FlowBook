
class FuncSpace {
  static c = 0;
  static global_space_var = "FuncSpace";
  static funcs = [];
  static newName() {
    FuncSpace.c+=1;
    name = FuncSpace.global_space_var+".func_"+FuncSpace.c; // get the variable contained by the nodespace variable on the python side
    FuncSpace.funcs.push(name);
    return name
  }
}
