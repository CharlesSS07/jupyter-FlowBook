
class SaveAble {

  static onSerialize(obj) {
    throw "onSerialize() of SaveAble must be implemented";
  }

  static onDeserialize(string, obj) {
    throw "onDeserialize() of SaveAble must be implemented";
  }
}
