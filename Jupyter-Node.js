
class Node extends SaveAble {

  constructor(nodeManager, type, cell) {
    super();
    this.active = 0;
    this.cell = cell;
    this.nodeManager = nodeManager;
    if (!type) {
      type = this.getNodeManager().newType(new NodeType(null, cell.get_text()))
    }
    this.type = type;
    this.makeCodeCell();
    this.makeResizable();
    this.addInputPinButton = null;
    this.makeAddInputPinButton();
    this.pinInputDiv = null;
    this.makePinInputDiv();
    this.pinOutputDiv = null;
    this.makePinOutputDiv();
    this.titleDiv = null;
    this.makeTitleDiv();
    this.makeDraggable();
    this.inputs = []; // list of NodePinInputs
    //this.addInputPin();
    this.outputs = [];// list of NodePinOutputs
    this.executed = false;
    this.changed = false;

    this.getTitleField().val(this.getType().getTitle());
    this.getTitleField()[0].placeholder = this.getType().getTitle();
    //console.log(this.getType().getInputList());
    for (var i of this.getType().getInputList()) {
      var pin = this.addInputPin(new NodePinInput(this));
      pin.setName(i);
    }
    this.updateCodeCell();
    //console.log(this.getType().getOutputList());
    for (var i of this.getType().getOutputList()) {
      var pin = this.addOutputPin(new NodePinOutput(this));
      pin.setName(i);
    }
  }

  /**
  * sets up code cell, inserts callbacks, and overrides cell.execute()
  * */
  makeCodeCell() {
    var me = this;
    var cell = this.getCodeCell();
    var input = this.getInputElem(); //cell.input;
    // eventes to update the code of all other cells with same type
    input.on('focusin', function() {
      me.updateCodeCell();
    });
    input.on('keyup', function() {
      me.getType().setCode(me.getCodeCell().get_text());
      me.changed = true;
    });
    input.on('focusout', function() {
      me.getType().setCode(me.getCodeCell().get_text());
    });
    // replace execute with my own function
    cell.execute_code = cell.execute;
    delete cell.execute;
    cell.execute = function () {
      me.execute();
    }
    // automatically update this cell on movement
    $(cell.element[0]).on('change', function() {
      me.updateCodeCell();
      //me.updateWires();
    })
  }

  /**
  * sets the text in this nodes cell to the code stored in this nodes type
  * */
  updateCodeCell() {
    var update = this.getType().getCode();
    var current = this.getCodeCell().get_text();
    if (update!=current) {
      this.getCodeCell().set_text(update);
    }
  }

  /**
  * sets up the div where NodePinInputs are appended
  * */
  makePinInputDiv() {
    var cell = this.getCodeCell();
    const inputDiv = $('<div>');
    inputDiv.prependTo(cell.element[0]);
    var me = this;
    inputDiv.on('click', function() {
      me.onSavingNode();
    });
    this.pinInputDiv = inputDiv;
    return inputDiv;
  }

  /**
  * returns the div where NodePinInputs are
  * */
  getPinInputDiv() {
    return this.pinInputDiv;
  }

  /**
  * sets up the div where NodePinOutputs are appended
  * */
  makePinOutputDiv() {
    var cell = this.getCodeCell();
    const outputDiv = $('<div>').addClass('node-output'); // justify all text to right
    outputDiv.appendTo(cell.element[0]);
    var me = this;
    outputDiv.on('click', function() {
      me.onSavingNode();
    });
    this.pinOutputDiv = outputDiv;
    return outputDiv;
  }

  /**
  * returns the div where NodePinOutputs are
  * */
  getPinOutputDiv() {
    return this.pinOutputDiv;
  }

  /**
  * sets up the div where the title and type selector are
  * */
  makeTitleDiv() {
    console.log('making title');
    var cell = this.getCodeCell();
    var me = this;
    // make dropdown for selecting title
    const dropdown = $('<select>').addClass('code-format').addClass('node-title');
    const titleDiv = $('<input>').addClass('code-format').addClass('node-title');
    // dropdown.css('width', '50px');
    dropdown.on('mousedown', function() {
      // dropdown opened
      dropdown.empty();
      // remove all previous titles and add our title, then all others
      var currentTitle = me.getType().getTitle();
      $('<option>').val(currentTitle).html(currentTitle).appendTo(dropdown);
      for (var e of me.getNodeManager().getTypes()) {
        // list all the titles that we can change type to
        var title = e.getTitle();
        if (title!=currentTitle) { // don't list this nodes title
          $('<option>').val(title).html(title).appendTo(dropdown);
        }
      }
    });
    dropdown.on('change', function(event) {
      // title was selected
      var currentTitle = me.getType().getTitle();
      var title = me.getNodeManager().getType($(this).find("option:selected").text(), '# Type not found!');
      if (currentTitle!=title) {
        me.setType(title);
      }
      // remove all previous titles from dropdown?
    });

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
    var div = $('<div>').addClass('code-format').addClass('node-title').append(dropdown).append(titleDiv);
    div.prependTo(cell.element[0]);
    this.titleDiv = div;
    return div;
  }

  /**
  * returns the div that contains the entire title bar
  * */
  getTitleDiv() {
    return this.titleDiv;
  }

  /**
  * returns the actual title input text field
  * */
  getTitleField() {
    return this.getTitleDiv().children(1);
  }

  /**
  * sets up the blank nodeinput that creates a new nodeinput when clicked on
  * */
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
    this.getCodeCell().element[0].prepend(pinInput.makePinDiv()[0]);
    //this.pinInputDiv = pinInput;
    return pinInput;
  }

  /**
  * called after deserialization, or something that has caused the wire elements to be deleted.
  * sets every nodes input pins to their output, creating the wires they need
  * */
  reInitializeWires() {
    for (var i of this.inputs) {
      i.setOutput(i.getOutput());
      i.updateWire();
    }
  }

  /**
  * causes this noes wires to update to the current context, such as node pin position
  * */
  updateWires(transform) {

    for (var i of this.inputs) {
      //i.setOutput(i.getOutput());
      i.updateWire(transform);
    }
    for (var i of this.outputs) {
      i.updateWire(transform);
    }
  }

  /**
  * sets this nodes title to that of its type
  * */
  updateTitle() {
    this.getTitleField().val(this.getType().getTitle());
  }

  /**
  * creates and tracks a pin input
  * */
  addInputPin(pinInput) {
    if (!pinInput) {
      pinInput = new NodePinInput(this);
    }
    this.inputs.push(pinInput);
    this.pinInputDiv.append(pinInput.makePinDiv());
    this.getType().setInputNames(this.inputs);
    return pinInput;
  }

  /**
  * creates and tracks a pin output
  * */
  addOutputPin(pinOutput) {
    // console.log('adding output pin');
    this.outputs.push(pinOutput);
    this.pinOutputDiv.append(pinOutput.makePinDiv());
    this.getType().setOutputNames(this.outputs);
    return pinOutput;
  }

  /**
  * deletes the pininput that is active
  * */
  removeActiveInputPin() {
    this.inputs[this.active].remove();
    this.inputs.splice(this.active, 1);
    this.active-=1;
  }

  /**
  * causes the active pin to change look different
  * */
  highlightActive() {
    // set the active input to be different from others, set others to be not highlighted
  }

  /**
  * returns a paramater name that has not been used by this node. should check with type about used names
  * */
  getAvaliableVarName(name) {
    // find a variable name that has not yet been used for this node
    for (var i of this.inputs) {
      if (i.getName()==name) {
        return this.getAvaliableVarName(name+'_2');
      }
    }
    return name;
  }

  /**
  * event that a pin has been selected by the user
  * */
  onPinSelected(pin) {
    //pass it on to node manager who can then tell who to wire together
    this.nodeManager.onPinSelected(pin);
  }

  /**
  * event that a pin has been focused by the user
  * */
  onPinFocused(pinInput) {
    this.active = this.inputs.indexOf(pinInput);
    this.highlightActive();
  }

  /**
  * event that a pin has been unfocused by the user
  * */
  onPinUnFocused(pinInput) {
    this.getType().setInputNames(this.inputs);
    this.getType().setOutputNames(this.outputs);
  }

  /**
  * event that causes this nodes metadata.node to update with newly serialized node
  * */
  onSavingNode() {
    this.getCodeCell().metadata.nodes = this.onSerialize();
  }

  /**
  * returns this nodes type
  * */
  getType() {
    return this.type;
  }

  /**
  * set this node to a new type, update the node accordingly
  * */
  setType(type) {
    // console.log('setting type');
    // this.type = type;
    
    // this should be unnecessary but it shouldn't hurt
    while (this.inputs.length>0) {
      this.inputs.pop().remove();
    }
    while (this.outputs.length>0) {
      this.outputs.pop().remove();
    }
    this.getPinInputDiv().remove();
    this.getPinOutputDiv().remove();
    this.getTitleDiv().remove();
    // this.makePinInputDiv();
    // this.makePinOutputDiv();
    // this.makeTitleDiv();
    // this.getTitleField().val(this.getType().getTitle());
    // this.getTitleField()[0].placeholder = this.getType().getTitle();
    // //console.log(this.getType().getInputList());
    // for (var i of this.getType().getInputList()) {
    //   var pin = this.addInputPin(new NodePinInput(this));
    //   pin.setName(i);
    // }
    // this.updateCodeCell();
    // //console.log(this.getType().getOutputList());
    // for (var i of this.getType().getOutputList()) {
    //   var pin = this.addOutputPin(new NodePinOutput(this));
    //   pin.setName(i);
    // }

    // remove the old cell, save its shape and position
    var nm = this.getNodeManager();
    var ocell = this.getCodeCell().element[0];
    var left = ocell.style.left;
    var top = ocell.style.top;
    var width = ocell.style.width;
    nm.removeNode(this);
    this.getCodeCell().element.remove();
    Jupyter.notebook.events.trigger('delete.Cell', {'cell': this.getCodeCell(), 'index': Jupyter.notebook.find_cell_index(this.getCodeCell())});

    // create new cell of selected type, and same shape and position
    var cell_options = {
      events: Jupyter.notebook.events,
      config: Jupyter.notebook.config,
      keyboard_manager: Jupyter.notebook.keyboard_manager,
      notebook: Jupyter.notebook,
      tooltip: Jupyter.notebook.tooltip
    };
    var cell = new Jupyter.CodeCell(Jupyter.notebook.kernel, cell_options);
    cell.set_input_prompt();
    if(Jupyter.notebook._insert_element_at_index(cell.element, 0)) {
      cell.render();
      cell.refresh();
      Jupyter.notebook.set_dirty(true);
    }
    var n = new Node(null, type, cell);
    nm.addNode(n);
    var ncell = cell.element[0];
    ncell.style.left = left;
    ncell.style.top = top;
    ncell.style.width = width;
  }

  /**
  * get this nodes actuall code celle element
  * */
  getCodeCell() {
    return this.cell;
  }

  /**
  * get this nodes code input area html element
  * */
  getInputElem() {
    return $(this.getCodeCell().code_mirror.display.input.textarea);
  }

  /**
  * get the node manager for this node
  * */
  getNodeManager() {
    return this.nodeManager;
  }

  /**
  * get this nodes outputs
  * */
  getOutputs() {
    return this.outputs;
  }

  /**
  * make this node be draggable by mouse cursor
  * */
  makeDraggable() {

    var me = this;
    var elmnt = this.getCodeCell().element[0];
    var dragElmnt = $('<div>').addClass('drag-bar').prependTo(elmnt)[0];
    var barCount = 5;
    for (var i =0;i<barCount;i++) {
      var bar = $('<div>').addClass('draggable-indicator').css('position', 'relative').css('top', i*(100/barCount)+'%').css('left', "0px");
      dragElmnt.append(bar[0]);
    }
    dragElmnt.onmousedown = dragMouseDown;
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    function dragMouseDown(ee) {
      ee = ee || window.event;
      ee.preventDefault();
      ee.stopPropagation();
      const e = me.getNodeManager().transformEvent(ee);
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
      me.onDragStart();
      $(dragElmnt).css('cursor', 'grabbing');
    }

    function elementDrag(ee) {
      ee = ee || window.event;
      ee.preventDefault();
      ee.stopPropagation();
      const e = me.getNodeManager().transformEvent(ee);
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
      $(dragElmnt).css('cursor', 'grab');
    }

  }

  /**
  * cause the node to appear infront of other nodes
  * */
  onBringToFront() {
    // should probably track the notebook container from nodeManager
    $('#notebook-container').append(this.getCodeCell().element[0]);
  }

  /**
  * event that this node is being dragged
  * */
  onDragStart() {
    this.updateWires();
    this.onBringToFront();
  }

  /**
  * event that this node is being dragged
  * */
  onDragging() {
    this.updateWires();
  }

  /**
  * event that this node is being dragged
  * */
  onDragEnd() {
    this.updateWires();
    this.onSavingNode();
  }

  /**
  * returns this nodes code wrapped for execution according to nodes outputs and inputs
  * */
  wrapCodeForExecution() {

    var code = this.getType().getCode();

    // composite paramaters

    var parameters = [];
    for (var i of this.inputs) {
      parameters.push(i.getName());
    }

    // composite function name

    // remove illegal characters
    var illegalFuncNameChars = '\t !@#$%^&\*()_+{}|:"<>?[]\\;\',./-="'.split('');
    var funcName = this.getType().getTitle()
    for (var i of illegalFuncNameChars) {
      funcName = funcName.replace(new RegExp('\\'+i, 'g'), '_');
    }
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

    return func.join('\n');
  }

  /**
  * actually run the code in a node correctly
  * */
  execute() {
    this.updateCodeCell();
    var cell = this.getCodeCell();
    cell.set_text(this.wrapCodeForExecution());
    cell.execute_code();
    cell.set_text(this.getType().getCode());
    this.executed = true;
    this.changed = false;
  }

  /**
  * makes a cell resizable by dragging the edges
  * */
  makeResizable() {
    var me = this;
    var cell = $(this.getCodeCell().element);

    // cell.resizable({handles: 'e, w'});
    // cell.on('resize', () => {me.onResizeEnd()});
    // create and add an invisible element on each side which will be dragged to resize the cell
    const rightHandle = document.createElement('div'); // right resizing handle
    const leftHandle  = document.createElement('div'); // left resizing handle

    rightHandle.classList.add('node-resize-handle');
    leftHandle.classList.add('node-resize-handle');

    rightHandle.style.right = 0;
    leftHandle.style.left = 0;

    cell.append(rightHandle);
    cell.append(leftHandle);



    // drag listener for right handle
    rightHandle.addEventListener('mousedown', function(e11){
        const e1 = me.getNodeManager().transformEvent(e11);
        //e1.preventDefault(); // don't drag, just resize
        const x1 = e1.x - parseInt(cell.css('width'));
        document.onmousemove = function(ee) {
            const e = me.getNodeManager().transformEvent(ee);
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
    leftHandle.addEventListener('mousedown', function(e11){
        const e1 = me.getNodeManager().transformEvent(e11);
        //e1.preventDefault(); // don't drag, just resize
        const x1 = e1.x - parseInt(cell.css('left'));
        const w1 = e1.x + parseInt(cell.css('width'));
        document.onmousemove = function(ee) {
            const e = me.getNodeManager().transformEvent(ee);
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
    this.updateWires();
  }

  /**
  * event called on resizing
  * */
  onResizing() {
    this.updateWires();
  }

  /**
  * event called on resizing
  * */
  onResizeEnd() {
    this.updateWires();
    this.onSavingNode();
  }

  /**
  * what to do to serialize this node, returns the serialized version
  * */
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

  /**
  * deserialize from string, edit this node to be like it never left
  * */
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

    this.type = this.getNodeManager().getType(obj.title, this.getCodeCell().get_text());

    for (var i of obj.inputs) {
      this.addInputPin((new NodePinInput(this)).onDeserialize(i));
    }
    for (var i of obj.outputs) {
      // console.log('making new output');
      this.addOutputPin((new NodePinOutput(this)).onDeserialize(i));
    }
    this.getTitleField().val(obj.title);
    this.getTitleField()[0].placeholder = obj.title;
    return this;
  }

}
