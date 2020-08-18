

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
    //this.getTransform().setTranslate(x, this.getBackground().getPanX());
    this.getNodeManager().onPan();
  }

  setPanY(y) {
    //this.getTransform().setTranslate(this.getBackground().getPanY(), y);
    this.getNodeManager().onPan();
  }

  setZoom(z) {
    //this.getTransform().setScale(z, z);
    this.getNodeManager().onPan();
  }

  // getTransform() {
  //   return this.getElement()[0].transform.baseVal[0];
  // }

}
