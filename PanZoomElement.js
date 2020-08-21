

class PanZoomElement {

  constructor(element) {
    this.element = element;
    this.background = null;
  }

  /**
  * set the parent NodeBackground of this PanZoomElement
  * */
  setBackground(background) {
    this.background = background;
  }

  /**
  * get the element that this PanZoomElement effects
  * */
  getElement() {
    return this.element;
  }

  /**
  * what to do when this element is panned on x
  * */
  setPanX(x) {
    throw "setPanX Not Implemented";
  }

  /**
  * what to do when this element is panned on y
  * */
  setPanY(y) {
    throw "setPanY Not Implemented";
  }

  /**
  * what to do when this element is panned
  * */
  setPan(x, y) {
    this.setPanX(x);
    this.setPanY(y);
  }

  /**
  * what to do when this element is zoomed
  * @param {number} z zoom factor. 1 indicates no zoom.
  * */
  setZoom(z) {
    throw "setZoom Not Implemented";
  }

  getBackground() {
    return this.background;
  }

}
