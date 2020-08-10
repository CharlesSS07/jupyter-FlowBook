define(['base/js/namespace','base/js/events', 'require'], function(Jupyter, events, requirejs) {

class Node {

  constructor(nodeManager, type) {
    this.active = 0;
    this.type = type;
    this.nodeManager = nodeManager;
    this.addInputPinButton = this.makeAddInputPinButton();
    this.pinInputDiv = this.makePinInputDiv(this.getType().getCell());
    this.pinOutputDiv = this.makePinOutputDiv(this.getType().getCell());
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

  getPinInputDiv() {
    return this.pinInputDiv;
  }

  getPinOutputDiv() {
    return this.pinOutputDiv;
  }

  makeAddInputPinButton() {
    const button = $('.btn-default').button();
    var me = this;
    button.on('click', function(e) {
      e.preventDefault();
      me.addInputPin();
      me.active = this.inputs.length-1;
      me.highlightActive();
    });
    button.prependTo(cell.element[0]);
    return button;
  }

  addInputPin() {
    const pinInput = new NodePinInput(this);
    this.inputs.push(pinInput);
    this.pinInputDiv.append(pinInput.getPin());
    this.pinInputDiv.append(pinInput.getField());
    this.pinInputDiv.append($('<br>'));
  }

  addOutputPin() {
    const pinOutput = new NodePinOutput(this);
    this.outputs.push(pinOutput);
    this.pinOutputDiv.append(pinOutput.getPin());
    this.pinOutputDiv.append(pinOutput.getField());

    this.pinOutputDiv.append($('<br>'));
  }

  removeActiveInputPin() {
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
    // nameInput.on('input', function() {
    //     //
    //
    // });
    nameInput.on('focusout', function(){
      // change the name of this variable to the next avaliable name
      var parentNode = me.getParentNode();
      me.setName(parentNode.getAvaliableVarName(nameInput.val()));
      nameInput.val(me.getName());
      nameInput.placeholder = me.getName();
      parentNode.onPinUnFocused(me);
    });
    return nameInput;
  }

  makePin() {
      const pin = $('<div>').addClass(`node-pin`);
      var me = this;
      pin.on('mousedown', function() {
        // notify the node that this pin has been selected
        me.getParentNode().onPinSelected(me);
      });
      pin.on('mouseup', function() {
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
    //this.wire = $('<line style="stroke:rgb(128,128,128,128);stroke-width:6" />').attr('x1', 0).attr('y1', 0).attr('x2', 100).attr('y2', 100).appendTo('#wire-layer');
    this.wire = $('<path class="wire" />').appendTo('#wire-layer');
    this.updateWire();
  }

  updateWire() {
    var out = this.getOutput();
    if (out !== null) {
      var wire = this.getWire();
      if (wire !== null) {
        console.log('Updating wire position');
        console.log(out.getPin());
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
        wire.attr('d', 'M '+x1+' '+y1+' C '+midx+' '+y1+', '+midx+' '+y2+', '+x2+' '+y2); // all the coordinates needed to draw a bezier
        //             M startx starty C supportx1 supporty1, supportx2 supporty2, endx, endy
        document.getElementById('svg-layer').innerHTML+=""; // weird hack to make svg update and show the new elements. I don't thinkg this needs to be done unless a new element is added
        //console.log(oPinElement.offsetLeft, oPinElement.offsetTop, iPinElement.offsetLeft, iPinElement.offsetTop);
      }
    }
  }

  getWire() {
    return this.wire;
  }

  getField() {
    return this.inputDiv;
  }

  getPin() {
    return this.pin;
  }

  getType() {
    return NodePinInput.INPUT_NODE_TYPE;
  }

}

class NodePinOutput extends NodePinInput {

  static OUTPUT_NODE_TYPE = 'output';

  constructor(parentNode) {
    super(parentNode);
    delete this.sourceOutput;
    this.pythonKernelVariable = VarSpace.newName();
  }

  getOutput() {
    return null;
  }

  setOutput() {
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

	constructor() {
		this.nodes = [];
		this.types = {};
    this.selectedIn = null;
    this.selectedOut = null;
	}

	newNode(cell) {
		var type = this.newType(new NodeType(null, cell));
		var newnode = new Node(this, type);
		this.nodes.push(newnode);
		return newnode;
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

  onPan(e) {

  }

  onZoom(e) {

  }

  onMoveNode(e, node) {

  }

	getNodes() {
		return this.nodes;
	}

  onCancelWiring(e) {
    //e.preventDefault();
    this.selectedIn = null;
    this.selectedOut = null;
    console.log("Wiring Cancelled");
  }

  onPinSelected(pinInput) {
    //run when a pin thinks its been selected
    if (pinInput.getType()==NodePinInput.INPUT_NODE_TYPE) {
      this.selectedIn = pinInput;
    } else if (pinInput.getType()==NodePinOutput.OUTPUT_NODE_TYPE) {
      this.selectedOut = pinInput;
    }
    console.log("Attempting to wire", this.selectedIn, this.selectedOut);
    //console.log(this.selectedIn!=null, this.selectedOut!=null, (this.selectIn!==null) === (this.selectedOut!==null));
    var inNonNull = this.selectIn !== null;
    var outNonNull = this.selectedOut !== null;
    if (inNonNull && outNonNull) {
      this.selectedIn.setOutput(this.selectedOut);
      console.log("Wired:",this.selectedIn, this.selectedOut);
      this.selectedIn = null;
      this.selectedOut = null;
    }
    console.log(inNonNull, outNonNull, inNonNull && outNonNull);
  }

}

function main() {
    // attach custom stylesheet
    $('<link/>').attr('type', 'text/css').attr('rel', 'stylesheet').attr('href', requirejs.toUrl('./style.css')).appendTo('head');

    // overlay svg for drawing wires
    $('<svg height="100%" width="100%" style="pointer-events:none;top:0;right:0;position:absolute;" id="svg-layer"><g transform="scale(1,1)translate(0,0)" id="wire-layer"></g></svg>').appendTo($('#notebook'));

    var nodeManager = new NodeManager();


    $('#notebook').on('mousedown', nodeManager.onCancelWiring);
    //$('#notebook').on('mouseup', nodeManager.onCancelWiring);
    // convert every existing cell to a node
    for (cell of Jupyter.notebook.get_cells().reverse()) {
        cellToNode(nodeManager, cell);
        nodeManager.newNode(cell);
    }

    // convert newly created cells to nodes
    events.on('create.Cell', (event, data)=>{
        cellToNode(nodeManager, data.cell);
    });


    zooming/panning around notebook
    loadView(); // load saved zoom/pan location
    addPanListener(); // listen for mouse drags to pan around
    addZoomListener(); // listen for scrolling to zoom
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
    makeDraggable(cell);
    makeResizable(cell);

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


}




/**
 * makes a cell movable by dragging on blank space
 * @param cell an html .cell element in a jupyter notebook to make movable
 * */
function makeDraggable(cell) {
    let deltaX = 0, deltaY = 0, x1 = 0, y1 = 0;
    cell.addEventListener('mousedown', function(event){
        event = event || window.event; // used by older browsers
        cell.click(); // select cell

        // $(cell).parent().append(cell); // bring element to top when clicked by sending it to the bottom of the html
        const parent = cell.parentElement; // get elements parent
        cell.remove(); // remove element
        parent.append(cell); // add it back, to the top
        if (event.target.nodeName == 'PRE' || event.target.nodeName == 'SPAN' || event.target.classList.contains('node-resize-handle') || event.target.nodeName == 'INPUT') {
            // dont activate dragging if user is selecting text or trying to resize with handle
        } else {
            event.preventDefault();
            // get the mouse cursor position at startup:
            x1 = event.x/Jupyter.notebook.metadata.nodes.view.zoom - parseInt($(cell).css('left'));
            y1 = event.y/Jupyter.notebook.metadata.nodes.view.zoom - parseInt($(cell).css('top'));
            document.onmousemove = function (e) {
                e = e || window.event; // used by older browsers
                e.preventDefault(); // stop other mouse move functions
                // calculate the change in cursor position
                deltaX = e.x/Jupyter.notebook.metadata.nodes.view.zoom - x1;
                deltaY = e.y/Jupyter.notebook.metadata.nodes.view.zoom - y1;
                // set the element's new position:
                $(cell).css('top', deltaY);
                $(cell).css('left', deltaX)
            };
            document.onmouseup = function() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            };
        }
    });
}

/**
 * makes a cell resizable by dragging the edges
 * @param cell an html .cell element in a jupyter notebook to make resizable
 * */
function makeResizable(cell) {
    // create and add an invisible element on each side which will be dragged to resize the cell
    const rightHandle = document.createElement('div'); // right resizing handle
    const leftHandle  = document.createElement('div'); // left resizing handle

    rightHandle.classList.add('node-resize-handle');
    leftHandle.classList.add('node-resize-handle');

    rightHandle.style.right = 0;
    leftHandle.style.left = 0;

    cell.appendChild(rightHandle);
    cell.appendChild(leftHandle);

    // drag listener for right handle
    rightHandle.onmousedown = function(e1){
        e1.preventDefault(); // don't drag, just resize
        const x1 = e1.x/Jupyter.notebook.metadata.nodes.view.zoom - parseInt(cell.style.width);
        document.onmousemove = function(e) {
            // change width on mouse move
            cell.style.width = e.x/Jupyter.notebook.metadata.nodes.view.zoom - x1 + "px";
        }
        document.onmouseup = function(e) {
            // finished resizing, remove listeners
            document.onmousemove = null;
            document.onmouseup = null;
        }
    };

    // drag listener for left handle
    leftHandle.onmousedown = function(e1){
        e1.preventDefault(); // don't drag, just resize
        const x1 = e1.x/Jupyter.notebook.metadata.nodes.view.zoom - parseInt(cell.style.left);
        const w1 = e1.x/Jupyter.notebook.metadata.nodes.view.zoom + parseInt(cell.style.width);
        document.onmousemove = function(e) {
            // change width on mouse move
            // for the left handle, the side has to move as well as the width changing
            cell.style.width = w1 - e.x/Jupyter.notebook.metadata.nodes.view.zoom + "px";
            cell.style.left = e.x/Jupyter.notebook.metadata.nodes.view.zoom - x1 + "px";
        }
        document.onmouseup = function(e) {
            // finished resizing, remove listeners
            document.onmousemove = null;
            document.onmouseup = null;
        }
    };
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
 * adds inputs and outputs and corresponding pins to cell
 * @param cell a html .cell element in a jupyter notebook to have pins added to
 * */
function addPins(cell_obj) {

    const inputsdiv = $('<div>').addClass('node-inputs').prependTo(cell_obj.element);

    for (let input in cell_obj.metadata.node.getInputs().inputs) {
        makePin('input').appendTo(inputsdiv).find('input').val(input);
    }
    makePin('input').appendTo(inputsdiv); // extra input for adding new inputs



    const outputsdiv = $('<div>').addClass('node-outputs').appendTo(cell_obj.element);

    for (let output in cell_obj.metadata.node.getInputs().inputs) { // plus one to add extra input for creating new ones
        makePin('output').appendTo(outputsdiv).find('input').val(output);
    }
    makePin('output').appendTo(outputsdiv); // extra input for adding new outputs





    function makePin(io) {
        if ('input' != io) io = 'output';
        const nameInput = $('<input>');
        nameInput.on('focusin', function(){
            // change to edit mode so keystrokes are not interpreted as commands
            cell_obj.events.trigger('edit_mode.Cell', {cell:cell_obj});
            $(this).data('oldval', $(this).val());
        });
        nameInput.on('input', function() {
            // add another if this is the last one
            if ($(this).closest(`.node-${io}`).is(':last-child')) {
                $(this).closest(`.node-${io}s`).append(makePin(io));
            }
        });
        nameInput.on('focusout', function(){
            // remove if blank, unless its the last child
            if ($(this).val() === '' && !$(this).closest(`node-${io}`).is(':last-child')) {
                $(this).closest(`node-${io}`).remove();
            }
            cell_obj.metadata.node.getInputs().onSetInputName($(this).data('oldval'), $(this).val());
        })
        const pin = $('<div>').addClass(`node-${io}-pin`);
        addWireDragListener(pin[0]);
        return $('<div>').append(pin).append(nameInput).addClass(`node-${io}`);
    }




    function addWireDragListener(pin) {
    //     pin.addEventListener('mousedown', function(e1){
    //         const opposite = pin.classList.contains('node-input-pin') ? 'node-output-pin' : 'node-input-pin';

    //         document.onmousemove = function(e) {
    //         };
    //         document.onmouseup = function(e) {
    //             // if dropped on opposite pin type, connect
    //             if (e.target.classList.contains(opposite)) {
    //                 const node1 = $(e.target).closest('.cell').data('cell').metadata.node;
    //                 const node2 = $(pin).closest('.cell').data('cell').metadata.node;
    //                 if (e.target.classList.contains('node-input-pin')) {
    //                     const inputPinName = $(e.target).closest('.node-input').find('input').val();
    //                     const inputNode = node1;
    //                     const outputNode = node2;
    //                 } else {
    //                     const inputPinName = $(pin).closest('.node-input').find('input').val();
    //                     const inputNode = node2;
    //                     const outputNode = node1;
    //                 }
    //                 inputNode.getInputs().setInput(
    //                     inputPinName,
    //                     outputNode.getOutput(),
    //                 )
    //             } else {
    //                 line.parent().remove(); // completely remove svg
    //             }
    //             document.onmousemove = null;
    //             document.onmouseup = null;
    //         }
    //     });
    }
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
 * add event listener for mouse dragging on the background to pan around the notebook
 * */
function addPanListener() {
    document.addEventListener('mousedown', function(e1) {
        let x1 = 0; let y1 = 0; let deltaX = 0; let deltaY = 0;
        if (e1.target.id == 'notebook') { // when clicking on the background
            x1 = e1.x;
            y1 = e1.y;
            $('#notebook').css('cursor', 'grabbing'); // show cursor grabbing page when panning
            document.onmousemove = function(e) { // pan based off mouse movement
                deltaX = e.x - x1;
                deltaY = e.y - y1;

                x1 = e.x;
                y1 = e.y;

                $('#notebook-container').css('transform', `${$('#notebook-container').css('transform')} translate(${deltaX/Jupyter.notebook.metadata.nodes.view.zoom}px,${deltaY/Jupyter.notebook.metadata.nodes.view.zoom}px)`)
            };
            document.onmouseup = function() { // stop panning
                // remove listeners
                document.onmousemove = null;
                document.onmouseup = null;
                // save position
                Jupyter.notebook.metadata.nodes.view.top  = matrixToArray($('#notebook-container').css('transform'))[5];
                Jupyter.notebook.metadata.nodes.view.left = matrixToArray($('#notebook-container').css('transform'))[4];
                // change cursor
                $('#notebook').css('cursor', 'grab');
            };
        }
    });
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
