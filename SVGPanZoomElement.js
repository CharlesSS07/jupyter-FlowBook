

class SVGPanZoomElement extends CSSPanZoomElement {

  constructor(element, background) {
    super(element);
    this.nodeManager = null;
  }

  setNodeManager(man) {
    this.nodeManager = man;
  }

  getNodeManager() {
    return this.nodeManager;
  }

  setPanX(x) {
    super.setPanX(x);
    this.getNodeManager().updateNodeWires();
  }

  setPanY(y) {
    super.setPanY(y);
    this.getNodeManager().updateNodeWires();
  }

  setZoom(z) {
    super.setZoom(z);
    this.getNodeManager().updateNodeWires();
  }


}
