
class NodeBackground {

  constructor(grabElement, elements) {
    this.elements = elements;
    for (var e of this.getElements()) {
      e.setBackground(this);
    }
    this.grabElement = grabElement;
  }

  /**
  * set initial view (zoom/pan location) from saved metadata
  * */
  loadView() {
    this.ensureNotebookNodeMetadataInitialized();
    this.ensureViewInitialized();
    this.setPan(this.getPanX(), this.getPanY());
    this.setZoom(this.getZoom());
  }

  /**
  * add event listener for mouse dragging on the background to pan around the notebook
  * */
  addPanListener() {
    var pan = this.getPan();
    var panX = pan[0];
    var panY = pan[1];
    var me = this;
    document.addEventListener('mousedown', function(e1) {
      let x1 = 0; let y1 = 0; let deltaX = 0; let deltaY = 0;
      if (e1.target.id == 'notebook') { // when clicking on the background
        x1 = e1.x;
        y1 = e1.y;
        var grabbed = me.getGrabElement();
        grabbed.css('cursor', 'grabbing'); // show cursor grabbing page when panning
        document.onmousemove = function(e) { // pan based off mouse movement
          deltaX = e.x - x1;
          deltaY = e.y - y1;

          x1 = e.x;
          y1 = e.y;

          panX+=deltaX/me.getZoom();
          panY+=deltaY/me.getZoom();

          //$('#notebook').css('transform', `${$('#notebook').css('transform')} translate(${deltaX/Jupyter.notebook.metadata.nodes.view.zoom}px,${deltaY/Jupyter.notebook.metadata.nodes.view.zoom}px)`);
          me.setPan(panX, panY);
        };
        document.onmouseup = function(e) { // stop panning
          // x1 = e.x;
          // y1 = e.y;
          // remove listeners
          document.onmousemove = null;
          document.onmouseup = null;
          // save position
          me.setPan(panX, panY);
          // change cursor
          grabbed.css('cursor', 'grab');
        };
      }
    });
  }

  /**
  * add event listener for mouse wheel scrolling on the background to zoom in/out on the notebook
  * */
  addZoomListener() {
    const me = this;
    function onZoom(e) {
      if (e.target.id == 'notebook') {
        const dzoom = (2**(-e.deltaY/500)); // multiply zoom by exponential of scroll to scale page by scroll amount
        //$('#notebook-container').css('transform', `${$('#notebook-container').css('transform')} scale(${dzoom})`); // scale notebook
        me.setZoom(dzoom*me.getZoom());
      }
    }
    document.addEventListener('mousewheel', onZoom);
    document.addEventListener('wheel', e=>{onZoom(e)});
  }







  /**
  * called before setting any notebook node metadata. initializes notebook.metadata.nodes if not already.
  * */
  ensureNotebookNodeMetadataInitialized() {
    if (!Jupyter.notebook.metadata.nodes) {
      Jupyter.notebook.metadata.nodes = {};
    }
  }

  /**
  * called before setting any notebook node view metadata. initializes notebook.metadata.nodes.view if not already.
  * */
  ensureViewInitialized() {
    this.ensureNotebookNodeMetadataInitialized();
    if (!Jupyter.notebook.metadata.nodes.view) {
      Jupyter.notebook.metadata.nodes.view = {};
    }
  }

  /**
  * set the pan of this nodeBackground
  * @param {number} x x pan offset
  * @param {number} y y pan offset
  * */
  setPan(x, y) {
    this.setPanX(x);
    this.setPanY(y);
  }
  
  //setZoom(zoom) {
  //      for (var e of this.getElements()) {
  //          //$('#notebook-container')
  //          //console.log(e, e.css('transform'));
  //          //e.css('transform', `${$('#notebook-container').css('transform')} scale(${dzoom})`); // scale notebook
  //          e.setZoom(zoom);
  //      }
  //  }

  /**
  * set the pan of this nodeBackground
  * @param {number} x x pan offset
  * */
  setPanX(x) {
    this.ensureViewInitialized();
    Jupyter.notebook.metadata.nodes.view.left = x;
    for (var e of this.getElements()) {
      e.setPanX(x);
    }
  }

  /**
  * set the pan of this nodeBackground
  * @param {number} y y pan offset
  * */
  setPanY(y) {
    this.ensureViewInitialized();
    Jupyter.notebook.metadata.nodes.view.top = y;
    for (var e of this.getElements()) {
      e.setPanY(y);
    }
  }

  getPanX(x) {
    this.ensureViewInitialized();
    if (Jupyter.notebook.metadata.nodes.view.left) {
      return parseInt(Jupyter.notebook.metadata.nodes.view.left);
    } else {
      return 0;
    }
  }

  getPanY(y) {
    this.ensureViewInitialized();
    if (Jupyter.notebook.metadata.nodes.view.top) {
      return parseInt(Jupyter.notebook.metadata.nodes.view.top);
    } else {
      return 0;
    }
  }

  getPan() {
    return [this.getPanX(), this.getPanY()];
  }

  getZoom() {
    this.ensureViewInitialized();
    if (Jupyter.notebook.metadata.nodes.view.zoom) {
      return Jupyter.notebook.metadata.nodes.view.zoom;
    } else {
      return 1;
    }
  }

  setZoom(z) {
    this.ensureViewInitialized();
    Jupyter.notebook.metadata.nodes.view.zoom = z;
    for (var e of this.getElements()) {
      e.setZoom(z);
    }
  }

  /**
  * get the list of PanZoomElements that this NodeBackground is managing.
  * */
  getElements() {
    return this.elements;
  }

  /**
  * get the element that when grapped, will pan other elements
  * */
  getGrabElement() {
    return this.grabElement;
  }

}
