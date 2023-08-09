

class WireCurvy extends Wire {

  getWireSVG() {
    if (!this.wire) {
      var svgGroup = $('#wire-layer'); // prehaps find a way to make this not magic
      this.wire = new SVGHelper('path', svgGroup);
      this.wire.get().classList.add('wire');
    }
    return this.wire.get();
  }

  getInputPosition() {
    return this.getOutput().getPin()[0].getBoundingClientRect();
  }

  getOutputPosition() {
    return this.getInput().getPin()[0].getBoundingClientRect()
  }

  update(transform) {
    var oPinOffset = this.getInputPosition();
    var iPinOffset = this.getOutputPosition();
    var nbContainerOffset = document.getElementById('notebook-container').getBoundingClientRect();
    //if (transform && transform.zoom) {
    //  oPinOffset.x *= transform.zoom;
    //  oPinOffset.y *= transform.zoom;
    //  iPinOffset.x *= transform.zoom;
    //  iPinOffset.y *= transform.zoom;
    //  //nbContainerOffset.x *= transform.zoom;
    //  //nbContainerOffset.y *= transform.zoom;
    //}
    var Ix = nbContainerOffset.x;
    var Iy = nbContainerOffset.y;
    var ox = oPinOffset.x + (oPinOffset.width/2);
    var oy = oPinOffset.y + (oPinOffset.height/2);
    var ix = iPinOffset.x + (iPinOffset.width/2);
    var iy = iPinOffset.y + (iPinOffset.height/2);
    var x1 = ix-Ix;
    var y1 = iy-Iy;
    var x2 = ox-Ix;
    var y2 = oy-Iy;
    var midx = (x1+x2)/2;
    var precentile = 0.5;
    var precentilex1 = (x1+x2)/(1/precentile);
    var precentilex2 = (x1+x2)/(1/(1-precentile));
    this.getWireSVG().setAttribute('d', 'M '+x1+' '+y1+' C '+precentilex1+' '+y1+', '+precentilex2+' '+y2+', '+x2+' '+y2); // all the coordinates needed to draw a bezier
    //             M startx starty C supportx1 supporty1, supportx2 supporty2, endx, endy
    document.getElementById('svg-layer').innerHTML+=""; // weird hack to make svg update and show the new elements. I don't thinkg this needs to be done unless a new element is added
  }

  remove() {
    this.getWireSVG().remove();
    this.wire = null;
   }
}
