define(['base/js/namespace','base/js/events', 'require'], function(Jupyter, events, requirejs) {






function addPins(node) {

    function makePin(x, y) {
        var pin = document.createElement('div');
        pin.className = "node-pin";
        pin.style.top = -y + "px";
        pin.style.left = x + "px";
        return pin;
    }

    var pin = makePin(node.offsetWidth, node.offsetHeight);
    pin.className+=" output-node-pin";
    node.append(pin);
}







function addToolMenu(node) {
    node.oncontextmenu = showToolMenu;

    function showToolMenu(e) {
        e = e || window.event;
        e.preventDefault();
        node.click(); // select node
        $('#maintoolbar').css('display', 'inline-block');
        $('#maintoolbar').css('top', e.clientY + 'px');
        $('#maintoolbar').css('left', e.clientX + 'px');
        document.addEventListener("click", hideToolMenu);
    }

    function hideToolMenu(e) {
        $('#maintoolbar').css('display', 'none');
    }
}




// converts a standard jupyter cell (DOM element) to a node with full functionality
function cellToNode(cell) {
    // make cell draggable and resiazble
    $(cell).resizable();
    $(cell).draggable();

    // add ui elements to cell
    addPins(cell);
    addToolMenu(cell);

    // keep position when converting to focusable
    const top  = cell.offsetTop;
    const left = cell.offsetLeft;
    const width = cell.offsetWidth;
    $(cell).css('position', 'absolute');
    $(cell).css('top',   top);
    $(cell).css('left',  left);
    $(cell).css('width', width)

    // bring element to top when clicked
    cell.addEventListener('mousedown', function(){
        $(this).parent().append($(this));
        this.click();
    });
}


// attach custom stylesheet
$('<link/>').attr('type', 'text/css').attr('rel', 'stylesheet').attr('href', requirejs.toUrl('./style.css')).appendTo('head');


// add jquery ui
$('<script>').attr('src', "https://code.jquery.com/ui/1.12.1/jquery-ui.js").appendTo('body');


// convert every existing cell to a node
for (cell of $('.cell').get().reverse()) {
    cellToNode(cell);
}

// convert created cells to nodes
Jupyter.notebook.events.on('create.Cell', (event, data)=>{
    cellToNode(data.cell.element[0]);
});




// (function() {
//     let x1; let y1;
//     background.onmousedown = startBackgroundPan;
//     function startBackgroundPan(e) {
//         // start background panning
//         x1 = e.clientX;
//         y1 = e.clietY;
//         document.onmousemove = backgroundPan;
//         document.onmouseup = stopBackgroundPan;
//     }
//     function backgroundPan(e) {
//         background.style.top  = y1 - e.clientY;
//         background.style.left = x1 - e.clientX;
//     }
//     function stopBackgroundPan(e) {
//         document.onmousemove = null;
//         document.onmouseup = null;
//     }
// })();


//document.getElementById('notebook-container').size = 10000000;
});
