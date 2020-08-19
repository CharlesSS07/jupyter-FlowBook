
class SaveAble {

  onSerialize() {
    throw "onSerialize() of SaveAble must be implemented";
  }

  onDeserialize(string) {
    throw "onDeserialize() of SaveAble must be implemented";
  }
}
