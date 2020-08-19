

class SVGPanZoomElement extends PanZoomElement {

  constructor(element, background) {
    super(element);
    //this.transform = this.getElement()[0].transform.baseVal[0];
    this.nodeManager = null;
  }

  setNodeManager(man) {
    this.nodeManager = man;
  }

  getNodeManager() {
    return this.nodeManager;
  }

  setPanX(x) {
    // this.getTransform().setTranslate(x, this.getBackground().getPanX());
    this.getNodeManager().updateNodeWires();
  }

  setPanY(y) {
    // this.getTransform().setTranslate(this.getBackground().getPanY(), y);
    this.getNodeManager().updateNodeWires();
  }

  setZoom(z) {
    // this.getTransform().setScale(z, z);
    this.getNodeManager().updateNodeWires();
  }

  // getTransform() {
  //   return this.getElement()[0].transform.baseVal[0];
  // }

}
