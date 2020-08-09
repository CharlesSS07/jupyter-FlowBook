define(['base/js/namespace','base/js/events', 'require'], function(Jupyter, events, requirejs) {

let nodeManager;

function main() {
    // attach custom stylesheet
    $('<link/>').attr('type', 'text/css').attr('rel', 'stylesheet').attr('href', requirejs.toUrl('./style.css')).appendTo('head');

    // import cell-node.js
    $('<script>').attr('src', requirejs.toUrl('./cell-node.js')).appendTo('body');
    nodeManager = new NodeManager();

    // convert every existing cell to a node
    for (cell of Jupyter.notebook.get_cells().reverse()) {
        cellToNode(cell);
    }

    // convert newly created cells to nodes
    events.on('create.Cell', (event, data)=>{
        cellToNode(data.cell);
    });


    // zooming/panning around notebook
    loadView(); // load saved zoom/pan location
    addPanListener(); // listen for mouse drags to pan around
    addZoomListener(); // listen for scrolling to zoom
}





/**
 * converts a jupyter notebook cell to a node by making it draggable and resizable, and adding titles and nodes and metadata
 * @param cell_obj a jupyter notebook cell object
 * */
function cellToNode(cell_obj) {
    const cell = cell_obj.element[0]; // get element

    // create node data in metadata
    if (!cell_obj.metadata.nodes) cell_obj.metadata.nodes = {};

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
    addToolMenu(cell);

    // code cells get pins and names
    if (cell_obj instanceof Jupyter.CodeCell) {
        addPins(cell_obj);
        addName(cell_obj);
    }

    cell_obj.metadata.node = nodeManager.newNode(cell_obj);
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
    if (!cell_obj.metadata.nodes.input)  cell_obj.metadata.nodes.input = [];
    if (!cell_obj.metadata.nodes.output) cell_obj.metadata.nodes.output = [];

    const inputsdiv = $('<div>').addClass('node-inputs').prependTo(cell_obj.element);

    const addInput = $('<input>').attr('type', 'button').val('+');
    $('<div>').appendTo(inputsdiv).append(addInput);
    addInput.mousedown(function(e){
        makePin('input').appendTo(inputsdiv);
    });
    
    for (let i in cell_obj.metadata.nodes.inputs) {
        makePin('input').appendTo(inputsdiv);
    }



    const outputsdiv = $('<div>').addClass('node-outputs').appendTo(cell_obj.element);

    const addOutput = $('<input>').attr('type', 'button').val('+');
    $('<div>').appendTo(outputsdiv).append(addOutput);;
    addOutput.mousedown(function(e){
        makePin('output').appendTo(outputsdiv);
    });
    
    for (let i in cell_obj.metadata.nodes.outputs) {
        makePin('output').appendTo(outputsdiv);
    }

    



    function makePin(io) {
        if ('input' != io) io = 'output';
        const ind = cell_obj.metadata.nodes[io].push({}) - 1;
        const nameInput = $('<input>');
        nameInput.focusin(function(){
            // change to edit mode so keystrokes are not interpreted as commands
            cell_obj.events.trigger('edit_mode.Cell', {cell:cell_obj});
        });
        nameInput.on('input', function() {
            // edit the pin name to value of text field
            cell_obj.metadata.nodes[io][ind].name = nameInput.val();
        });
        nameInput.val(cell_obj.metadata.nodes[io][ind].name || '');
        const pin = $('<div>').addClass(`node-${io}-pin`);
        addWireDragListener(pin[0]);
        return $('<div>').append(pin).append(nameInput).addClass(`node-${io}`);
    }




    function addWireDragListener(pin) {
        pin.addEventListener('mousedown', function(e1){
            // start dragging wire from this pin
            // const line = $('<line>').appendTo($('<svg>').addClass('node-wire-svg').appendTo($('#notebook-container')));
            // line.attr('x1', $(pin).position().left);
            // line.attr('y1', $(pin).position().top);
            const opposite = pin.classList.contains('node-input-pin') ? 'node-output-pin' : 'node-input-pin';

            document.onmousemove = function(e) {
                // point wire to end of mouse while moving
                // line.attr('x2', e.x);
                // line.attr('y2', e.y);
            };
            document.onmouseup = function(e) {
                // if dropped on opposite pin type, connect
                if (e.target.classList.contains(opposite)) {
                    // line.attr('x2', $(e.target).position().left);
                    // line.attr('y2', $(e.target).position().top);
                    const node1 = $(e.target).closest('.cell').data('cell').metadata.node;
                    const node2 = $(pin).closest('.cell').data('cell').metadata.node;
                    if (e.target.classList.contains('node-input-pin')) {
                        const inputPinName = $(e.target).closest('.node-input').find('input').val();
                        const inputNode = node1;
                        const outputNode = node2;
                    } else {
                        const inputPinName = $(pin).closest('.node-input').find('input').val();
                        const inputNode = node2;
                        const outputNode = node1;
                    }
                    inputNode.getInputs().setInput(
                        inputPinName,
                        outputNode.getOutput(),
                    )
                } else {
                    line.parent().remove(); // completely remove svg
                }
                document.onmousemove = null;
                document.onmouseup = null;
            }
        });
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
        cell_obj.metadata.nodes.name = nameInput.val();
    });
    nameInput.val(cell_obj.metadata.nodes.name || 'node');
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
    document.addEventListener('mousewheel', function(e) {
        if (e.target.id == 'notebook') {
            const dzoom = (2**(-e.deltaY/500)); // multiply zoom by exponential of scroll to scale page by scroll amount
            Jupyter.notebook.metadata.nodes.view.zoom *= dzoom;
            $('#notebook-container').css('transform', `${$('#notebook-container').css('transform')} scale(${dzoom})`);
            $('#notebook-container').css('font-size', `${parseInt($('#notebook-container').css('font-size'))/dzoom}`);
        }
    });
}






function matrixToArray(str) {
    // extract parameters from string like 'matrix(1, 2, 3, 4, 5, 6)'
    return str.match(/(-?[0-9\.]+)/g);
}





main();
});
