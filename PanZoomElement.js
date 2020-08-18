

class PanZoomElement {

  constructor(element) {
    this.element = element;
    this.background = null;
  }

  setBackground(background) {
    this.background = background;
  }

  getElement() {
    return this.element;
  }

  setPanX(x) {
    throw "setPanX Not Implemented";
  }

  setPanY(y) {
    throw "setPanY Not Implemented";
  }

  setPan(x, y) {
    this.setPanX(x);
    this.setPanY(y);
  }

  setZoom(z) {
    throw "setZoom Not Implemented";
  }

  getBackground() {
    return this.background;
  }

}
