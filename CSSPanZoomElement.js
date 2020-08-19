

class CSSPanZoomElement extends PanZoomElement {

  setPanX(x) {
    this.getElement().css('left', x);
  }

  setPanY(y) {
    this.getElement().css('top', y);
  }

  setZoom(z) {
    this.getElement().css('zoom', z);
  }

}
