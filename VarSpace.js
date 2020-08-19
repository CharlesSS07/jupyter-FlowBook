
class VarSpace {
  static c = VarSpace.getVarid();
  static global_space_var = "NodeVarSpace";
  static newName() {
    VarSpace.c+=1;
    Jupyter.notebook.metadata.nodes.varid = VarSpace.c;
    return VarSpace.global_space_var+"['"+VarSpace.c+"']"; // get the variable contained by the nodespace variable on the python side
  }

  static getVarid() {
    if (Jupyter.notebook.metadata.nodes && Jupyter.notebook.metadata.nodes.varid) return Jupyter.notebook.metadata.nodes.varid;
    return 0;
  }

}
