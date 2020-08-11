
class Node {

  constructor(nodeManager, type) {
    this.active = 0;
    this.type = type;
    this.makeDraggable();
    this.nodeManager = nodeManager;
    this.addInputPinButton = this.makeAddInputPinButton();
    this.pinInputDiv = this.makePinInputDiv(this.getType().getCell());
    this.pinOutputDiv = this.makePinOutputDiv(this.getType().getCell());
    this.titleDiv = this.makeTitleDiv(this.getType().getCell());
    this.inputs = []; // list of NodePinInputs
    this.addInputPin();
    this.outputs = [];// list of NodePinOutputs
    this.addOutputPin();
  }

  makePinInputDiv(cell) {
    const inputDiv = $('<div>');
    //alert(JSON.stringify(cell.element[0]));
    inputDiv.prependTo(cell.element[0]);
    //cell.element[0].prepend(inputDiv);
    return inputDiv;
  }

  makePinOutputDiv(cell) {
    const outputDiv = $('<div>').addClass('node-output'); // justify all text to right
    outputDiv.appendTo(cell.element[0]);
    return outputDiv;
  }

  makeTitleDiv(cell) {
    const titleDiv = $('<input>').addClass('code-format').addClass('node-title');
    // const listDiv = $('<div>').addClass('dropdown-content');
    var me = this;
    titleDiv.on('focusin', function(e){
      // turn off edit mode so can type
      var cell = me.getType().getCell();
      cell.events.trigger('edit_mode.Cell', {cell:cell});
      // show the div
      // listDiv[0].classList.toggle('show');
    });
    // titleDiv.on('keyup', function(e){
    //   // show only the functions that match the new filter
    //   listDiv[0].innerHTML='';
    //   console.log(me.getNodeManager().getTypes());
    //   for (var type in me.getNodeManager().getTypes()) {
    //     console.log(type);
    //     var title = type.getTitle();
    //     if (title.indexOf(titleDiv.val())) {
    //       $('<div>').text(title).addClass('dropdown-content').appendTo(listDiv).onmousedown = function(e) {
    //         titleDiv.val(title);
    //         //me.setType(type);
    //       };
    //       $('<br>').appendTo(listDiv);
    //     }
    //   }
    // });
    // titleDiv.on('focusout', function(e){
    //   listDiv[0].classList.toggle('show');
    // });
    titleDiv.prependTo(cell.element[0]);
    return titleDiv;
  }

  getPinInputDiv() {
    return this.pinInputDiv;
  }

  getPinOutputDiv() {
    return this.pinOutputDiv;
  }

  makeAddInputPinButton() {
    // const buttonDiv = $('<div>').attr('width', "50px");
    // const button = $('<button>').text('+').addClass('add-input-button');
    // var me = this;
    // button.on('click', function(e) {
    //   e.preventDefault();
    //   me.addInputPin();
    //   me.active = me.inputs.length-1;
    //   me.highlightActive();
    // });
    // buttonDiv.prependTo(cell.element[0]);
    // button.prependTo(cell.element[0]);
    const pinInput = new NodeAddPinInputButton(this);
    cell.element[0].prepend(pinInput.getDiv()[0]);
    return pinInput;
  }

  updateWires() {
    for (var i of this.inputs) {
      i.updateWire();
    }
    for (var i of this.outputs) {
      i.updateWire();
    }
  }

  addInputPin() {
    const pinInput = new NodePinInput(this);
    this.inputs.push(pinInput);
    this.pinInputDiv.append(pinInput.getDiv());
    return pinInput;
  }

  addOutputPin() {
    const pinOutput = new NodePinOutput(this);
    this.outputs.push(pinOutput);
    this.pinOutputDiv.append(pinOutput.getPin());
    this.pinOutputDiv.append(pinOutput.getField());
    this.pinOutputDiv.append($('<br>'));
    return pinOutput;
  }

  removeActiveInputPin() {
    this.inputs[this.active].remove();
    this.inputs.splice(this.active, 1);
    this.active-=1;
  }

  highlightActive() {
    // set the active input to be different from others, set others to be not highlighted
  }

  getAvaliableVarName(name) {
    // find a variable name that has not yet been used for this node
    for (var i of this.inputs) {
      if (i.getName()==name) {
        return this.getAvaliableVarName(name+'_2');
      }
    }
    return name;
  }

  onPinSelected(pin) {
    //pass it on to node manager who can then tell who to wire together
    this.nodeManager.onPinSelected(pin);
  }

  onPinFocused(pinInput) {
    this.active = this.inputs.indexOf(pinInput);
    this.highlightActive();
  }

  onPinUnFocused(pinInput) {

  }

  getType() {
    return this.type;
  }

  setType(type) {
    this.cell = this.getType().getCell().element[0];
    this.type = type;
    this.cell = this.getType().getCell().element[0];
  }

  getNodeManager() {
    return this.nodeManager;
  }

  makeDraggable() {

    var me = this;
    var elmnt = this.getType().getCell().element[0];
    elmnt.onmousedown = dragMouseDown;
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    function dragMouseDown(e) {
      e = e || window.event;
      //e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;

      //console.log(e.target.className.split(/\s+/));
      if (e.target===elmnt) { // only when this element is being clicked. avoids the text fields and node inputs
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
        me.onDragStart();
      }
    }

    function elementDrag(e) {
      e = e || window.event;
      //e.preventDefault();
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

  onDragStart() {
    this.updateWires();
    $('#notebook-container').append(this.getType().getCell().element[0]);
  }

  onDragging() {
    this.updateWires();
  }

  onDragEnd() {
    this.updateWires();
  }

}
