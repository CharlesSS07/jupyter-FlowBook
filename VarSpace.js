
class VarSpace {
  static c = 0;
  static global_space_var = "NodeSpace";
  static newName() {
    VarSpace.c+=1;
    return VarSpace.global_space_var+"["+VarSpace.c+"]"; // get the variable contained by the nodespace variable on the python side
  }
}
