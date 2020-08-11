define(['base/js/namespace','base/js/events', 'require'], function(Jupyter, events, requirejs) {

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

  class NodePinInput {

    static INPUT_NODE_TYPE = 'input';
    constructor(parentNode) {
      this.name = '';
      this.sourceOutput = null;
      this.parentNode = parentNode;
      this.inputDiv = this.makeInput();
      this.pin = this.makePin();
      this.wire = null;
    }

    setParentNode(parentNode) {
      this.parentNode = parentNode;
    }

    getParentNode() {
      return this.parentNode;
    }

    makeInput() {
      const nameInput = $('<input>').addClass('code-format');
      var me = this;
      nameInput.on('focusin', function(){
        // change to edit mode so keystrokes are not interpreted as commands
        var parentNode = me.getParentNode();
        var cell = parentNode.getType().getCell();
        cell.events.trigger('edit_mode.Cell', {cell:cell});
        parentNode.onPinFocused(me);
      });
      function setSize() {
        var size = nameInput.val().length;
        if (size>20) {
          nameInput[0].size = size;
        } else {
          nameInput[0].size = 20;
        }
      }
      nameInput.on('input', function() {
        setSize();
      });
      nameInput.on('focusout', function(){
        var parentNode = me.getParentNode();
        if (nameInput.val()=='') {
          parentNode.removeActiveInputPin(); // should remove this because is active
        }
        // change the name of this variable to the next avaliable name
        me.setName(parentNode.getAvaliableVarName(nameInput.val()));
        nameInput.val(me.getName());
        nameInput.placeholder = me.getName();
        parentNode.onPinUnFocused(me);
        setSize();
        this.computeWire();
      });
      return nameInput;
    }

    makePin() {
      const pin = $('<div>').addClass(`node-pin`);
      var me = this;
      pin.on('mousedown', function(e) {
        console.log("selected");
        e.preventDefault();
        // notify the node that this pin has been selected
        me.getParentNode().onPinSelected(me);
      });
      pin.on('mouseup', function(e) {
        console.log("selected");
        e.preventDefault();
        // notify the node that this pin has been selected
        me.getParentNode().onPinSelected(me);
      });
      return pin;
    }

    getName() {
      return this.name;
    }

    setName(name) {
      this.name = name;
    }

    getOutput() {
      return this.sourceOutput;
    }

    setOutput(pinOutput) {
      delete this.sourceOutput;
      this.sourceOutput = pinOutput;
      this.getOutput().addInput(this);
      //this.wire = $('<line style="stroke:rgb(128,128,128,128);stroke-width:6" />').attr('x1', 0).attr('y1', 0).attr('x2', 100).attr('y2', 100).appendTo('#wire-layer');
      if (this.wire !== null) {
        console.log('removing', this.wire);
        document.getElementById(this.wire).remove();
      }
      // id="'+this.getOutput().getOutputVariable()+'"
      var id = Math.random();

      this.computeWire();
      var path = $('<path id="'+this.wire+'" />')[0];
      path.classList.add('wire');
      document.getElementById('wire-layer').append(path);
      this.updateWire();
    }

    updateWire() {
      //console.log(this.getOutput());
      var out = this.getOutput();
      if (out !== null) {
        var wire = this.getWire();
        console.log(this.wire);
        if (wire) {
          console.log('Updating wire position');
          //console.log(out.getPin());
          var oPinOffset = out.getPin()[0].getBoundingClientRect();
          var iPinOffset = this.getPin()[0].getBoundingClientRect();
          var nbContainerOffset = document.getElementById('notebook').getBoundingClientRect();
          var Ix = nbContainerOffset.x;
          var Iy = nbContainerOffset.y;
          var ox = oPinOffset.x + (oPinOffset.width/2);
          var oy = oPinOffset.y + (oPinOffset.height/2);
          var ix = iPinOffset.x + (iPinOffset.width/2);
          var iy = iPinOffset.y + (iPinOffset.height/2);
          console.log(Ix, Iy, ox, oy, ix, iy);
          var x1 = ix-Ix;
          var y1 = iy-Iy;
          var x2 = ox-Ix;
          var y2 = oy-Iy;
          // wire.attr('x1', ix-Ix);
          // wire.attr('y1', iy-Iy);
          // wire.attr('x2', ox-Ix);
          // wire.attr('y2', oy-Iy);
          var midx = (x1+x2)/2;
          var precentile = 0.5;
          var precentilex1 = (x1+x2)/(1/precentile);
          var precentilex2 = (x1+x2)/(1/(1-precentile));
          //this.wire.attr('d', '');
          console.log(wire.getAttribute( 'd'));
          wire.setAttribute('d', 'M '+x1+' '+y1+' C '+precentilex1+' '+y1+', '+precentilex2+' '+y2+', '+x2+' '+y2); // all the coordinates needed to draw a bezier
          console.log(wire.getAttribute('d'));
          //             M startx starty C supportx1 supporty1, supportx2 supporty2, endx, endy
          document.getElementById('svg-layer').innerHTML+=""; // weird hack to make svg update and show the new elements. I don't thinkg this needs to be done unless a new element is added
        }
      }
    }

    getWire() {
      return document.getElementById(this.wire);
    }

    computeWire() {
      if (this.wire) {
        document.getElementById(this.wire).remove();
      }
      this.wire = this.wire = "wires/"+this.getOutput().getOutputVariable()+'/'+this.getParentNode().getType().getTitle()+'/'+this.getParentNode().getNodeManager().getNodeIndex(this)+'/'+this.getName();
    }

    setWire(wire) {
      this.wire = wire;
    }

    getField() {
      return this.inputDiv;
    }

    getPin() {
      return this.pin;
    }

    getDiv() {
      var div = $('<div>').addClass('node-input');
      div.append(this.getPin());
      div.append(this.getField());
      return div;
    }

    getType() {
      return NodePinInput.INPUT_NODE_TYPE;
    }

    remove() {
      this.getPin()[0].parentNode.remove();
    }

  }

  class NodeAddPinInputButton extends NodePinInput {

    makeInput() {
      const nameInput = super.makeInput();
      nameInput.placeholder = '+'
      var me = this;
      nameInput.off('focusin'); //remove the behaviors that super added
      nameInput.on('focusin', function(){
        var parentNode = me.getParentNode();
        var newInput = parentNode.addInputPin();
        newInput.getField().focus();
      });
      nameInput.off('focusout'); //remove the behaviors that super added
      return nameInput;
    }

    makePin() {
      const nameInput = super.makePin().addClass('inactive-pin');
      return nameInput;
    }

  }

  class NodePinOutput extends NodePinInput {

    static OUTPUT_NODE_TYPE = 'output';

    constructor(parentNode) {
      super(parentNode);
      delete this.sourceOutput;
      this.pythonKernelVariable = VarSpace.newName();
      this.inputs = [];
    }

    addInput(input) {
      this.inputs.push(input);
    }

    removeInput(input) {
      if (this.inputs.include(input)) {
        this.inputs.splice(this.inputs.indexOf(input), 1);
      }
    }

    updateWire() {
      for (var i of this.inputs) {
        i.updateWire();
      }
    }

    getOutput() {
      return null;
    }

    setOutput(o) {
      return;
    }

    getOutputVariable() {
      return this.pythonKernelVariable;
    }

    getType() {
      return NodePinOutput.OUTPUT_NODE_TYPE;
    }

  }

  class VarSpace {
    static c = 0;
    static global_space_var = "NodeSpace";
    static newName() {
      VarSpace.c+=1;
      return VarSpace.global_space_var+"["+VarSpace.c+"]"; // get the variable contained by the nodespace variable on the python side
    }
  }

  class FuncSpace {
    static c = 0;
    static global_space_var = "FuncSpace";
    static funcs = [];
    static newName() {
      FuncSpace.c+=1;
      name = FuncSpace.global_space_var+".func_"+FuncSpace.c; // get the variable contained by the nodespace variable on the python side
      FuncSpace.funcs.push(name);
      return name
    }
  }

  class NodeType {

    constructor(title, cell) {
      this.cell = cell; // cell to display, function to run on
      this.title = title; // title of this cell
      if (this.title==null) {
        this.title = FuncSpace.newName();
        this.named = false;
      }
    }

    setTitle(title) {
      if (FuncSpace.funcs.includes(title)) {
        const newname = this.setTitle(title+".copy");
        FuncSpace.funcs.push(newname);
        return newname;
      }
      this.title = title;
      this.named = true;
      FuncSpace.funcs.push(this.title);
      return this.title;
    }

    getTitle() {
      return this.title;
    }

    getCell() {
      return this.cell;
    }

  }

  class NodeManager {

    constructor(background) {
      // background is a jquery element that is the agreed upon background for the nodeManager
      this.backgroundDiv = background;
      this.nodes = [];
      this.types = {};
      this.selectedIn = null;
      this.selectedOut = null;
      //this.selected = [false, false];
      var me = this;
      this.backgroundDiv.on('mouseup', function(e) {
        // on mouse up, cancel the wire if it is being drawn, and pin is over notebook
        //console.log(e.target);
        //console.log(nodeManager.selectedIn, nodeManager.selectedOut);
        if (e.target===me.background[0]) {
          me.onCancelWiring(e);
        }
        //console.log(nodeManager.selectedIn, nodeManager.selectedOut);
      });
    }

    newNode(cell) {
      var type = this.newType(new NodeType(null, cell));
      var newnode = new Node(this, type);
      this.nodes.push(newnode);
      return newnode;
    }

    getNewNodeInstance(type) {
      var newnode = new Node(this, type);
      this.nodes.push(newnode);
      return newnode;
    }

    getNewNodeInstance(cell) {
      return this.getNewNodeInstance(this.getType(cell));
    }

    getNewNodeInstance(title) {
      return this.getNewNodeInstance(this.getType(cell));
    }

    wireNodes(outputNode, inputNode, pinName) {
      output = outputNode.getOutput()
      input = inputNode.getInputs();
      input.wire(output, name);
    }

    newType(type) {
      if (Object.keys(this.types).includes(type)) {
        this.types[type]+= 1;
      } else {
        this.types[type] = 1;
      }
      return type;
    }

    getType(cell) {
      for (var type of Object.keys(this.types)) {
        if (type.getCell()==cell) {
          return type;
        }
      }
      return this.newType(new NodeType(null, cell));
    }

    getType(title) {
      for (var type of Object.keys(this.types)) {
        if (type.getTitle()==title) {
          return type;
        }
      }
      throw "No known NodeType by title "+title;
    }

    getTypes() {
      return this.types;
    }

    onPan(e) {
      //update all nodes wire
      for (node of this.nodes) {
        node.updateWires();
      }
    }

    onZoom(e) {
      node.updateWires();
    }

    onMoveNode(e, node) {
      node.updateWires();
    }

    getNodes() {
      return this.nodes;
    }

    onCancelWiring(e) {
      //e.preventDefault();
      delete this.selectedIn;
      delete this.selectedOut;
      this.selectedIn = null;
      this.selectedOut = null;
      //this.selected = [false, false];
      //console.log("Wiring Cancelled");
    }

    onPinSelected(pinInput) {
      //run when a pin thinks its been selected
      if (pinInput.getType()==NodePinInput.INPUT_NODE_TYPE) {
        this.selectedIn = pinInput;
        //this.selected[0] = true;
        //console.log('input pin selected', this.selectedIn);
      } else if (pinInput.getType()==NodePinOutput.OUTPUT_NODE_TYPE) {
        this.selectedOut = pinInput;
        //this.selected[1] = true;
        //console.log('output pin selected', this.selectedOut);
      }
      //console.log("Attempting to wire", this.selectedIn, this.selectedOut);
      var inNonNull = Boolean(this.selectedIn); // false when null, true when nonnull
      var outNonNull = Boolean(this.selectedOut);
      //console.log("Decision criteria:", inNonNull, outNonNull, inNonNull && outNonNull);
      if (inNonNull && outNonNull) {
        this.selectedIn.setOutput(this.selectedOut);
        //console.log("Wired:",this.selectedIn, this.selectedOut);
        delete this.selectedIn;
        delete this.selectedOut;
        this.selectedIn = null;
        this.selectedOut = null;
        //this.selected = [false, false];
      }
    }

    getNodeIndex(node) {
      return this.nodes.indexOf(node);
    }

  }

  function main() {
    // attach custom stylesheet
    $('<link/>').attr('type', 'text/css').attr('rel', 'stylesheet').attr('href', requirejs.toUrl('./style.css')).appendTo('head');

    // overlay svg for drawing wires
    $('<svg height="100%" width="100%" style="pointer-events:none;top:0;right:0;position:absolute;" id="svg-layer"><g transform="scale(1,1)translate(0,0)" id="wire-layer"></g></svg>').appendTo($('#notebook'));

    var nodeManager = new NodeManager($('#notebook'));

    // convert every existing cell to a node
    for (cell of Jupyter.notebook.get_cells().reverse()) {
      //nodeManager.newNode(cell);
      cellToNode(nodeManager, cell);
    }

    // convert newly created cells to nodes
    events.on('create.Cell', (event, data)=>{
      //nodeManager.getNewNodeInstance(data.cell);
      cellToNode(nodeManager, data.cell);
    });


    // zooming/panning around notebook
    loadView(); // load saved zoom/pan location
    //addPanListener(); // listen for mouse drags to pan around
    //addZoomListener(); // listen for scrolling to zoom
  }


  /**
  * converts a jupyter notebook cell to a node by making it draggable and resizable, and adding titles and nodes and metadata
  * @param cell_obj a jupyter notebook cell object
  * */
  function cellToNode(nodeManager, cell_obj) {

    const cell = cell_obj.element[0]; // get element

    // create node data in metadata
    if (!cell_obj.metadata.nodes) cell_obj.metadata.nodes = {};
    if (!cell_obj.metadata.nodes.zoom) cell_obj.metadata.nodes.zoom = {};

    //cell_obj.metadata.node = nodeManager.newNode(cell_obj);

    // make cell movable and resizable
    //makeDraggable(cell);
    //makeResizable(cell);

    // write node metadata if it doesn't have any yet
    if (!cell_obj.metadata.nodes.boundingBox) {
      saveNodeMetadata();
    }

    // set cell position according to metadata
    $(cell).css('top',   cell_obj.metadata.nodes.boundingBox.top);
    $(cell).css('left',  cell_obj.metadata.nodes.boundingBox.left);
    $(cell).css('width', cell_obj.metadata.nodes.boundingBox.width);

    // save new position when changed
    cell.addEventListener('mouseup', function(e){
      saveNodeMetadata();
    });

    function saveNodeMetadata() {
      // save position
      if (!cell_obj.metadata.nodes.boundingBox) cell_obj.metadata.nodes.boundingBox = {};
      cell_obj.metadata.nodes.boundingBox.top = cell.offsetTop;
      cell_obj.metadata.nodes.boundingBox.left = cell.offsetLeft;
      cell_obj.metadata.nodes.boundingBox.width = cell.offsetWidth;
    }

    // ad custom context menu  of tools/actions for cell
    //addToolMenu(cell);

    // code cells get pins and names
    if (cell_obj instanceof Jupyter.CodeCell) {
      //addPins(cell_obj);
      //addName(cell_obj);
    }

    var node = nodeManager.newNode(cell_obj);
  }


  /**
  * adds context menu of actions for a cell when right-clicked
  * @param cell an html .cell element in a jupyter notebook to have custom context menu added to
  * */
  function addToolMenu(cell) {
    cell.oncontextmenu = function (e) {
      e = e || window.event;
      if (!e.shiftKey) { // display normal context menu when shift key is held
        e.preventDefault();
        cell.click(); // select node
        $('#maintoolbar').css('display', 'inline-block');
        $('#maintoolbar').css('top', e.clientY + 'px');
        $('#maintoolbar').css('left', e.clientX + 'px');
        document.onclick = function () {
          $('#maintoolbar').css('display', 'none');
          document.onclick = null;
        };
      }
    };
  }


  /**
  * adds a name to a cell displayed at the top as a header of the cell
  * @param cell an html .cell element in a jupyter notebook to have a name header added to
  * */
  function addName(cell_obj) {
    const nameInput = $('<input>');
    nameInput.focusin(function(){
      // change to edit mode so keystrokes are not interpreted as commands
      cell_obj.events.trigger('edit_mode.Cell', {cell:cell_obj});
    });
    nameInput.on('input', function() {
      // edit the node name to value of text field
      // cell_obj.metadata.nodes.name = nameInput.val();
      nameInput.val(cell_obj.metadata.node.getType().setTitle(nameInput.val()));
    });
    nameInput.on('focusout', function() {
      nameInput.val(cell_obj.metadata.node.getType().setTitle(nameInput.val()));
    });
    // initial value is defined by node object
    nameInput.val(cell_obj.metadata.node.getType().getTitle());
    $('<div>').addClass('node-name').append(nameInput).prependTo(cell_obj.element);
  }

  // panning/zooming functionality

  /**
  * set initial view (zoom/pan location) from saved metadata
  * */
  function loadView() {
    if (!Jupyter.notebook.metadata.nodes) Jupyter.notebook.metadata.nodes = {};
    if (!Jupyter.notebook.metadata.nodes.view) Jupyter.notebook.metadata.nodes.view = {};
    $('#notebook-container').css('transform',  `matrix(
      ${Jupyter.notebook.metadata.nodes.view.zoom}, 0,
      0, ${Jupyter.notebook.metadata.nodes.view.zoom},
      ${Jupyter.notebook.metadata.nodes.view.left}, ${Jupyter.notebook.metadata.nodes.view.top})`);
    }



    /**
    * add event listener for mouse wheel scrolling on the background to zoom in/out on the notebook
    * */
    function addZoomListener() {
      function onZoom(e) {
        if (e.target.id == 'notebook') {
          const dzoom = (2**(-e.deltaY/500)); // multiply zoom by exponential of scroll to scale page by scroll amount
          Jupyter.notebook.metadata.nodes.view.zoom *= dzoom;
          $('#notebook-container').css('transform', `${$('#notebook-container').css('transform')} scale(${dzoom})`); // scale notebook
        }
      }
      document.addEventListener('mousewheel', onZoom);
      document.addEventListener('wheel', e=>{onZoom(e)});
    }

    function matrixToArray(str) {
      // extract parameters from string like 'matrix(1, 2, 3, 4, 5, 6)'
      return str.match(/(-?[0-9\.]+)/g);
    }





    main();
  });
