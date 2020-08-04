define(['base/js/namespace','base/js/events'], function(Jupyter, events) {


/**


function makeDraggable(node) {
    let deltax = 0, deltay = 0, x1 = 0, y1 = 0;
    //   if (document.getElementById(node.id + "header")) {
    //     // if present, the header is where you move the DIV from:
    //     document.getElementById(node.id + "header").onmousedown = dragMouseDown;
    //   } else {
    //     // otherwise, move the DIV from anywhere inside the DIV:
    //     node.onmousedown = dragMouseDown;
    //   }
    node.onmousedown = dragMouseDown;
    node.style.position = 'absolute';
    node.style.width = '500px';
    node.style.resizable = 'both';
    node.style.background = 'white';
    node.style.zIndex = 1;
    node.style.boxShadow = "black 0px 0px 10px 0px";

    function dragMouseDown(e) {
        e = e || window.event;
        node.click(); // select node
        // bring element to top when clicked
        const parent = node.parentElement; // get elements parent
        node.remove(); // remove element
        parent.append(node); // add it back, to the top
        if (e.target.nodeName == 'PRE' || e.target.nodeName == 'SPAN') {
        // dont activate dragging if user is selecting text
        } else {
            e.preventDefault();
            // get the mouse cursor position at startup:
            x1 = e.clientX;
            y1 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        deltax = x1 - e.clientX;
        deltay = y1 - e.clientY;
        x1 = e.clientX;
        y1 = e.clientY;
        // set the element's new position:
        node.style.top = (node.offsetTop - deltay) + "px";
        node.style.left = (node.offsetLeft - deltax) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


*/





function load_css (name) {
    $('<link/>').attr({
        type: 'text/css',
        rel: 'stylesheet',
        href: requirejs.toUrl(name)
    }).appendTo('head');
}


console.log(requirejs.toUrl('./style.css'))


load_css('./style.css');






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
        //         document.onmouseup = null;
    }
}






/**


function getCoords(elem) { // crossbrowser version
var box = elem.getBoundingClientRect();

var body = document.body;
var docEl = document.documentElement;

var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

var clientTop = docEl.clientTop || body.clientTop || 0;
var clientLeft = docEl.clientLeft || body.clientLeft || 0;

var top  = box.top +  scrollTop - clientTop;
var left = box.left + scrollLeft - clientLeft;

//     console.log(top, left);

return [top, left];
}

*/


// add custom stylesheet
$('head').append('<link rel="stylesheet" href="/files/style.css">');

// add jquery ui
$('body').append('<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>');


// make cells draggable and resizable
$('.cell').draggable();
$('.cell').resizable();


// make floating cells opaque and in the same plane
//$('.cell').css('background', 'white');
//$('.cell').css('z-index', 1);
//$('.cell').css('box-shadow', "black 0px 0px 5px 0px"); // add box shadow
//$('.cell').css('width', '500px');
// $('.cell').css('transition', '0s');



//$('#notebook-container').css('transition', '1s');
//$('#notebook-container').css('background', 'transparent');
//$('#notebook-container').css('box-shadow', 'none');


// turn all the cells into floating movable nodes=
for (cell of $('.cell').get().reverse()) {
    //     c = getCoords(cell); // get curent coordinates of the cell
    //     cell.css('top', c[0]);
    //     cell.css('left', c[1]);
    addPins(cell);
    addToolMenu(cell);
    const top  = cell.offsetTop;//getBoundingClientRect().top;
    const left = cell.offsetLeft;//getBoundingClientRect().left;
    const width = cell.offsetWidth;
//    console.log(cell);
//    console.log(cell.getBoundingClientRect());
    $(cell).css('position', 'absolute');
    $(cell).css('top',   top);
    $(cell).css('left',  left);
    $(cell).css('width', width)



    cell.addEventListener('mousedown', function(){
    // bring element to top when clicked
    $(this).parent().append($(this));
        this.click();
    });
}




// ncontainer.style.background = 'transparent';
// ncontainer.style.boxShadow = 'none';





// const background = document.getElementById('notebook');

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

//addNode(document.getElementById('notebook_panel'), "test node", [new InputVariable("x"), new InputVariable("y")], new Cell()); // add new stuff

//alert("run");




});
