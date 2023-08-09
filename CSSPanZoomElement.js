

class CSSPanZoomElement extends PanZoomElement {

  setPanX(x) {
    this.getElement().css('left', x);
    //this.getElement().css('transform', `translate(${x}, 0)`);
  }

  setPanY(y) {
    this.getElement().css('top', y);
  }

  setZoom(z) {
    this.getElement().css('zoom', z);
  }

}
