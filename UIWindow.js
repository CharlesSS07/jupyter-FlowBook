
class UIElementIn {

  getElement() {

  }

}

class ChildElementIn {

  getParentElement() {

  }

}

class ObscurableElementIn extends UIElementIn, ChildElementIn {

  /**
  * cause the node to appear infront of other nodes
  * */
  onBringToFront() {

  }

  onSendToBack() {

  }
}

class ObscurableElement extends ObscurableElementIn {

  /**
  * cause the node to appear infront of other nodes
  * */
  onBringToFront() {
    $(this.getParentElement()).append(this.getElement());
  }

  onSendToBack() {
    $(this.getParentElement()).prepend(this.getElement());
  }

}

class ResizableElementIn extends UIElementIn {

  constructor() {

    var cell = $(this.getElement());
    // create and add an invisible element on each side which will be dragged to resize the cell
    const rightHandle = document.createElement('div'); // right resizing handle
    const leftHandle  = document.createElement('div'); // left resizing handle

    rightHandle.classList.add('node-resize-handle');
    leftHandle.classList.add('node-resize-handle');

    rightHandle.style.right = 0;
    leftHandle.style.left = 0;

    cell.append(rightHandle);
    cell.append(leftHandle);

    var me = this;

    // drag listener for right handle
    rightHandle.addEventListener('mousedown', function(e1){
        //e1.preventDefault(); // don't drag, just resize
        const x1 = e1.x - parseInt(cell.css('width'));
        document.onmousemove = function(e) {
            // change width on mouse move
            cell.css('width', e.x - x1 + "px");
            me.onResizing();
        }
        document.onmouseup = function(e) {
            // finished resizing, remove listeners
            document.onmousemove = null;
            document.onmouseup = null;
            me.onResizeEnd();
        }
        me.onResizeStart();
    });

    // drag listener for left handle
    leftHandle.addEventListener('mousedown', function(e1){
        //e1.preventDefault(); // don't drag, just resize
        const x1 = e1.x - parseInt(cell.css('left'));
        const w1 = e1.x + parseInt(cell.css('width'));
        document.onmousemove = function(e) {
            // change width on mouse move
            // for the left handle, the side has to move as well as the width changing
            cell.css('width', w1 - e.x + "px");
            cell.css('left',e.x - x1 + "px");
            me.onResizing();
        }
        document.onmouseup = function(e) {
            // finished resizing, remove listeners
            document.onmousemove = null;
            document.onmouseup = null;
            me.onResizeEnd();
        }
        me.onResizeStart();
    });
  }

  /**
  * event called on resizing
  * */
  onResizeStart() {

  }

  /**
  * event called on resizing
  * */
  onResizing() {

  }

  /**
  * event called on resizing
  * */
  onResizeEnd() {

  }

}

class DraggableElementIn extends UIElementIn {

  constructor() {
    var me = this;
    var elmnt = this.getElement();
    var dragElmnt = $('<div>').addClass('drag-bar').prependTo(elmnt)[0];
    var barCount = 5;
    for (var i =0;i<barCount;i++) {
      var bar = $('<div>').addClass('draggable-indicator').css('position', 'relative').css('top', i*(100/barCount)+'%').css('left', "0px");
      dragElmnt.append(bar[0]);
    }
    dragElmnt.onmousedown = dragMouseDown;
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      e.stopPropagation();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
      me.onDragStart();
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      e.stopPropagation();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      me.onDragging();
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
      me.onDragEnd();
    }
  }

  /**
  * event that this node is being dragged
  * */
  onDragStart() {

  }

  /**
  * event that this node is being dragged
  * */
  onDragging() {

  }

  /**
  * event that this node is being dragged
  * */
  onDragEnd() {

  }

}

class UIWindowElementIn extends ResizableElementIn, DraggableElementIn, ObscurableElement {

  constructor(htmlElement) {
    super();
    this.elem = htmlElement;
  }

  getElement() {
    return this.elem;
  }

  getParentElement() {

  }

  /**
  * event that this node is being dragged
  * */
  onDragStart() {
    this.onBringToFront();
  }

  /**
  * event that this node is being dragged
  * */
  onDragging() {

  }

  /**
  * event that this node is being dragged
  * */
  onDragEnd() {
    this.onBringToFront();
  }

  /**
  * event called on resizing
  * */
  onResizeStart() {
    this.onBringToFront();
  }

  /**
  * event called on resizing
  * */
  onResizing() {

  }

  /**
  * event called on resizing
  * */
  onResizeEnd() {
    this.onBringToFront();
  }

}
