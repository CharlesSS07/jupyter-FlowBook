define(['base/js/namespace','base/js/events', 'require'], function(Jupyter, events, requirejs) {



//function getCellById(id) {
//    return Jupyter.notebook.get_cells().find(cell => cell.metadata.nodes.id == id);
//}









function addTitle(cell_obj) {
    if (!cell_obj.metadata.nodes.title) cell_obj.metadata.nodes.title = '';
    $('<div>').attr('class', 'node-title').html(cell_obj.metadata.nodes.title).prependTo(cell_obj.element);
}




function addPins(cell_obj) {
    if (!cell_obj.metadata.nodes.inputs) cell_obj.metadata.nodes.inputs = [];
    if (!cell_obj.metadata.nodes.outputs) cell_obj.metadata.nodes.outputs = [];



    const inputsdiv = $('<div>').attr('class', 'node-inputs').prependTo(cell_obj.element);
    for (let pin of cell_obj.metadata.nodes.inputs) {
        $('<div>').attr('class', 'node-input').append($('<input>').val(pin.name)).appendTo(inputsdiv);
    }

    const addInput = $('<input>').attr('type', 'button').val('+');
    $('<div>').appendTo(inputsdiv).append(addInput);
    addInput.click(function(e){
        console.log(e);
        console.log('add input');
        cell_obj.metadata.nodes.inputs.push({'name':''})
    });




    const outputsdiv = $('<div>').attr('class', 'node-outputs').appendTo(cell_obj.element);
    for (let pin of cell_obj.metadata.nodes.outputs) {
        $('<div>').attr('class', 'node-output').append($('<input>').val(pin.name)).appendTo(outputsdiv);
    }

    const addOutput = $('<input>').attr('type', 'button').val('+');
    $('<div>').appendTo(outputsdiv).append(addOutput);;
    addOutput.click(function(e){
        console.log('add output');
        cell_obj.metadata.nodes.outputs.push({'name':''})
    });
}







function addToolMenu(node) {
    node.oncontextmenu = showToolMenu;

    function showToolMenu(e) {
        e = e || window.event;
        if (!e.shiftKey) {
            e.preventDefault();
            node.click(); // select node
            $('#maintoolbar').css('display', 'inline-block');
            $('#maintoolbar').css('top', e.clientY + 'px');
            $('#maintoolbar').css('left', e.clientX + 'px');
            document.addEventListener("click", hideToolMenu);
        }
    }

    function hideToolMenu(e) {
        $('#maintoolbar').css('display', 'none');
    }
}




// converts a standard jupyter cell (DOM element) to a node with full functionality
function cellToNode(cell_obj) {
    const cell = cell_obj.element[0]; // get element

    // create node data in metadata
    if (!cell_obj.metadata.nodes) cell_obj.metadata.nodes = {};

//    // get unique id
//    if (!cell_obj.metadata.nodes.id)

    // make cell draggable and resizable
    $(cell).resizable({
        minWidth: 200,
        handles: 'e, w'
    });
    $(cell).draggable();

    // add ui elements to cell
    addPins(cell_obj);
    addTitle(cell_obj);
    addToolMenu(cell);

    // position nodes according to metadata
    if (!cell_obj.metadata.nodes.boundingBox) {
        saveNodeMetadata();
    }
    $(cell).css('position', 'absolute');
    $(cell).css('top',   cell_obj.metadata.nodes.boundingBox.top);
    $(cell).css('left',  cell_obj.metadata.nodes.boundingBox.left);
    $(cell).css('width', cell_obj.metadata.nodes.boundingBox.width);


    // bring element to top when clicked
    cell.addEventListener('mousedown', function(){
        $(this).parent().append($(this)); // move cell to the end of div, making it display over the others
        this.click(); // activate other click functionality (usually cancelled by draggable)
    });
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
}


// attach custom stylesheet
$('<link/>').attr('type', 'text/css').attr('rel', 'stylesheet').attr('href', requirejs.toUrl('./style.css')).appendTo('head');


// add jquery ui
$('<script>').attr('src', "https://code.jquery.com/ui/1.12.1/jquery-ui.js").appendTo('body');


// convert every existing cell to a node
for (cell of Jupyter.notebook.get_cells().reverse()) {
    cellToNode(cell);
}

// convert newly created cells to nodes
Jupyter.notebook.events.on('create.Cell', (event, data)=>{
    cellToNode(data.cell);
});


// panning/zooming functionality

// set starting view from metadata
if (!Jupyter.notebook.metadata.nodes) Jupyter.notebook.metadata.nodes = {};
if (!Jupyter.notebook.metadata.nodes.view) Jupyter.notebook.metadata.nodes.view = {};
$('#notebook-container').css('top',  Jupyter.notebook.metadata.nodes.view.top  || 0);
$('#notebook-container').css('left', Jupyter.notebook.metadata.nodes.view.left || 0);
$('#notebook-container').css('zoom', Jupyter.notebook.metadata.nodes.view.zoom || 1);

// create pan/zoom event listeners
(function(){
    // panning
    let x1 = 0; let y1 = 0; let startX = 0; let startY = 0; let deltaX = 0; let deltaY = 0;
    document.addEventListener('mousedown', function(e) {
        if (e.target.id == 'notebook') { // when clicking on the background
            x1 = e.x;
            y1 = e.y;
            startX = $('#notebook-container')[0].offsetLeft;
            startY = $('#notebook-container')[0].offsetTop;
            $('#notebook').css('cursor', 'grabbing');
            // start panning until mouse goes back up
            document.onmousemove = function(e) { // pan based off mouse movement
               deltaX = e.x - x1;
               deltaY = e.y - y1;
               $('#notebook-container').css('top', startY+deltaY/$('#notebook-container').css('zoom'))
               $('#notebook-container').css('left', startX+deltaX/$('#notebook-container').css('zoom'));
           };
            document.onmouseup = function() { // stop panning
                // remove listeners
                document.onmousemove = null;
                document.onmouseup = null;
                // save position
                Jupyter.notebook.metadata.nodes.view.top  = $('#notebook-container')[0].offsetTop;
                Jupyter.notebook.metadata.nodes.view.left = $('#notebook-container')[0].offsetLeft;
                // change cursor
                $('#notebook').css('cursor', 'grab');
            };
        }
    });



    // zooming
    document.addEventListener('mousewheel', function(e) {
        if (e.target.id == 'notebook') {
            // zoom exponentially
            $('#notebook-container').css('zoom', $('#notebook-container').css('zoom')*(2**(-e.deltaY/500)));
            // save zoom position
            Jupyter.notebook.metadata.nodes.view.zoom  = $('#notebook-container').css('zoom');
        }
    });
})();



});
