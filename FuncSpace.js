
class FuncSpace extends SaveAble {
  static c = 0;
  static global_space_var = "FuncSpace";
  static funcs = [];
  static newName() {
    FuncSpace.c+=1;
    name = FuncSpace.global_space_var+".func_"+FuncSpace.c; // get the variable contained by the nodespace variable on the python side
    FuncSpace.funcs.push(name);
    return name
  }

  static onSerialize(obj2) {
    var obj = {};
    obj.c = FuncSpace.c;
    obj.global_space_var = FuncSpace.global_space_var;
    obj.funcs = FuncSpace.funcs;
    return JSON.stringify(obj);
  }

  static onDeserialize(string, instance) {
    var obj = JSON.parse(string);
    FuncSpace.c = obj.c;
    FuncSpace.global_space_var = obj.global_space_var;
    FuncSpace.funcs = obj.funcs;
    return FuncSpace;
  }

}
