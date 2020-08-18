
class Node extends SaveAble {

  constructor(nodeManager, type, cell) {
    super();
    this.active = 0;
    this.cell = cell;
    this.type = type;
    this.makeCodeCell();
    this.makeDraggable();
    this.makeResizable();
    this.nodeManager = nodeManager;
    this.addInputPinButton = null;
    this.makeAddInputPinButton(this.getCodeCell());
    this.pinInputDiv = null;
    this.makePinInputDiv(this.getCodeCell());
    this.pinOutputDiv = null;
    this.makePinOutputDiv(this.getCodeCell());
    this.titleDiv = null;
    this.makeTitleDiv(this.getCodeCell());
    this.inputs = []; // list of NodePinInputs
    //this.addInputPin();
    this.outputs = [];// list of NodePinOutputs
    this.addOutputPin();
  }

  makeCodeCell() {
    var me = this;
    var cell = this.getCodeCell();
    var input = cell.input;
    input.on('focusin', function() {
      me.updateCodeCell();
    });
    input.on('keyup', function() {
      me.getType().setCode(me.getCodeCell().get_text());
    });
    input.on('focusout', function() {
      me.getType().setCode(me.getCodeCell().get_text());
    });
    cell.execute_code = cell.execute;
    delete cell.execute;
    cell.execute = function () {
      me.execute();
    }
  }

  updateCodeCell() {
    this.getCodeCell().set_text(this.getType().getCode());
  }

  makePinInputDiv(cell) {
    const inputDiv = $('<div>');
    inputDiv.prependTo(cell.element[0]);
    var me = this;
    inputDiv.on('click', function() {
      me.onSavingNode();
    });
    this.pinInputDiv = inputDiv;
    return inputDiv;
  }

  getPinInputDiv() {
    return this.pinInputDiv;
  }

  makePinOutputDiv(cell) {
    const outputDiv = $('<div>').addClass('node-output'); // justify all text to right
    outputDiv.appendTo(cell.element[0]);
    var me = this;
    outputDiv.on('click', function() {
      me.onSavingNode();
    });
    this.pinOutputDiv = outputDiv;
    return outputDiv;
  }

  getPinOutputDiv() {
    return this.pinOutputDiv;
  }

  makeTitleDiv(cell) {
    var me = this;
    const dropdown = $('<select>').addClass('code-format').addClass('node-title');
    // dropdown.css('width', '50px');
    dropdown.on('mousedown', function() {
      dropdown.empty();
      var currentTitle = me.getType().getTitle();
      $('<option>').val(currentTitle).html(currentTitle).appendTo(dropdown);
      for (var e of me.getNodeManager().getTypes()) {
        var title = e.getTitle();
        console.log(title);
        $('<option>').val(title).html(title).appendTo(dropdown);
      }
    });
    dropdown.on('change', function(event) {
      me.setType(me.getNodeManager().getType($(this).find("option:selected").text(), '# Type not found!'));
    });
    const titleDiv = $('<input>').addClass('code-format').addClass('node-title');
    // const listDiv = $('<div>').addClass('dropdown-content');
    var originalColor = null;
    titleDiv.on('focusin', function(e){
      // turn off edit mode so can type
      var cell = me.getCodeCell();
      cell.events.trigger('edit_mode.Cell', {cell:cell});
      // show the div
      // listDiv[0].classList.toggle('show');
      originalColor = titleDiv.css('background-color');
    });
    titleDiv.on('keyup', function(e) {
      // if this name is taken and this node is not already of that type
      if (FuncSpace.funcs.includes(titleDiv.val()) && me.getType().getTitle()!=titleDiv.val()) {
        titleDiv.css('background-color', '#cc3300');
      }
    });
    titleDiv.on('focusout', function(e){
      titleDiv.val(me.getType().setTitle(titleDiv.val()));
      titleDiv.placeholder = me.getType().getTitle();
      titleDiv.css('background-color', originalColor);
      me.onSavingNode();
    });
    //titleDiv.prependTo(cell.element[0]);
    this.titleDiv = titleDiv;
    var div = $('<div>').addClass('code-format').addClass('node-title').append(dropdown).append(titleDiv);
    div.prependTo(cell.element[0]);
    return div;
  }

  makeAddInputPinButton(cell) {
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
    cell.element[0].prepend(pinInput.makePinDiv()[0]);
    this.pinInputDiv = pinInput;
    return pinInput;
  }

  updateWires() {

    for (var i of this.inputs) {
      i.setOutput(i.getOutput());
      i.updateWire();
    }
    for (var i of this.outputs) {
      i.updateWire();
    }
  }

  updateTitle() {
    this.inputDiv.val(this.getType().getTitle());
  }

  addInputPin(pinInput) {
    if (!pinInput) {
      pinInput = new NodePinInput(this);
    }
    this.inputs.push(pinInput);
    this.pinInputDiv.append(pinInput.makePinDiv());
    return pinInput;
  }

  addOutputPin() {
    const pinOutput = new NodePinOutput(this);
    this.outputs.push(pinOutput);
    this.pinOutputDiv.append(pinOutput.makePinDiv());
    //this.pinOutputDiv.append($('<br>'));
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

  onSavingNode() {
    this.getCodeCell().metadata.nodes = this.onSerialize();
  }

  getType() {
    return this.type;
  }

  setType(type) {
    this.type = type;
    this.titleDiv.val(this.getType().getTitle());
    this.titleDiv[0].placeholder = this.getType().getTitle();
    while (this.inputs.length>0) {
      this.inputs.pop().remove();
    }
    while (this.outputs.length>0) {
      this.outputs.pop().remove();
    }
    this.getPinInputDiv().innerHTML = '';
    this.getPinOutputDiv().innerHTML = '';
    this.getPinInputDiv().remove();
    this.getPinOutputDiv().remove();
    this.makePinInputDiv(this.getCodeCell());
    this.makePinOutputDiv(this.getCodeCell());
    console.log(this.getType().getInputList());
    for (var i of this.getType().getInputList()) {
      var pin = this.addInputPin(new NodePinInput(this));
      pin.setName(i);
    }
    this.getCodeCell().clear_output();
    this.updateCodeCell();
    this.getCodeCell().set_text(this.getType().getCode());
    for (var i of this.getType().getOutputList()) {
      var pin = this.addOutputPin(new NodePinOutput(this));
      pin.setName(i);
    }
  }

  getCodeCell() {
    return this.cell;
  }

  getNodeManager() {
    return this.nodeManager;
  }

  getOutputs() {
    return this.outputs;
  }

  makeDraggable() {

    var me = this;
    var elmnt = this.getCodeCell().element[0];
    elmnt.onmousedown = dragMouseDown;
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    function dragMouseDown(e) {
      e = e || window.event;
      //e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;

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

  onBringToFront() {
    // should probably track the notebook container from nodeManager
    $('#notebook-container').append(this.getCodeCell().element[0]);
  }

  onDragStart() {
    this.updateWires();
    this.onBringToFront();
  }

  onDragging() {
    this.updateWires();
  }

  onDragEnd() {
    this.updateWires();
    this.onSavingNode();
  }

  wrapCodeForExecution() {

    var code = this.getType().getCode();

    // composite paramaters

    var parameters = [];
    for (var i of this.inputs) {
      parameters.push(i.getName());
    }

    // composite function name

    var funcName = this.getType().getTitle();
    var func = ['def '+funcName+'( '+parameters.join(', ')+' ):'];

    // add tabs in front of all lines for def

    for (var line of code.split('\n')) {
      func.push('  '+line);
    }

    // make last line return

    func[func.length-1] = '  return '+func[func.length-1];

    // composite input paramaters

    var inParameters = [];
    for (var i of this.inputs) {
      var parameter = "";
      parameter+=i.getName();
      var out = i.getOutput();
      if (out) {
        var outVar = out.getOutputVariable();
        parameter+='='+outVar;
      }
      inParameters.push(parameter);
    }

    // composite function run

    var outVar = this.getOutputs()[0].getOutputVariable();
    func.push(outVar+' = '+funcName+'('+inParameters.join(', ')+')');

    // give output to jupyter notebook in last line so that it will show in output box

    func.push(outVar);

    console.log(func);
    return func.join('\n');
  }

  execute() {
    this.updateCodeCell();
    var cell = this.getCodeCell();
    cell.set_text(this.wrapCodeForExecution());
    cell.execute_code();
    cell.set_text(this.getType().getCode());
    this.executed = true;
  }

  /**
  * makes a cell resizable by dragging the edges
  * @param cell an html .cell element in a jupyter notebook to make resizable
  * */
  makeResizable() {
    var cell = $(this.getCodeCell().element[0]);
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
    rightHandle.onmousedown = function(e1){
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
    };

    // drag listener for left handle
    leftHandle.onmousedown = function(e1){
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
    };
  }

  onResizeStart() {
    this.updateWires();
  }

  onResizing() {
    this.updateWires();
  }

  onResizeEnd() {
    this.updateWires();
  }

  onSerialize() {
    var obj = {};
    obj.boundingBox = {};
    obj.boundingBox.y =     this.getCodeCell().element[0].offsetTop;
    obj.boundingBox.x =     this.getCodeCell().element[0].offsetLeft;
    obj.boundingBox.width = this.getCodeCell().element[0].offsetWidth;
    obj.inputs = [];
    for (var i of this.inputs) {
      obj.inputs.push(i.onSerialize());
    }
    obj.outputs = [];
    for (var i of this.outputs) {
      obj.outputs.push(i.onSerialize());
    }
    obj.title = this.getType().getTitle();
    return JSON.stringify(obj);
  }

  onDeserialize(string) {
    if (!string) {
      return this;
    }
    var obj = JSON.parse(string);
    if (!obj) {
      return this;
    }
    $(this.getCodeCell().element[0]).css('top', obj.boundingBox.y);
    $(this.getCodeCell().element[0]).css('left', obj.boundingBox.x);
    $(this.getCodeCell().element[0]).css('width', obj.boundingBox.width);
    for (var i of obj.inputs) {
      this.addInputPin((new NodePinInput(this)).onDeserialize(i));
    }
    for (var i of this.outputs) {
      i.remove();
    }
    this.outputs = [];
    for (var i of obj.outputs) {
      this.addOutputPin((new NodePinOutput(this)).onDeserialize(i));
    }

    this.type = this.getNodeManager().getType(obj.title, this.getCodeCell().get_text());
    //this.titleDiv.val(obj.title);
    this.titleDiv[0].placeholder = obj.title;
    return this;
  }

}
