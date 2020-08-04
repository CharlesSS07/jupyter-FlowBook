
//console.log('imported');
//alert("running");
// class VarNameHandler {
// 	static count = 0;
// 	static prefix = 'v_';
	
// 	static getNewVarName() {
// 		VarNameHandler.count+=1;
// 		return VarNameHandler.prefix+VarNameHandler.count;
// 	}
// }

// class Cell {
// 	constructor() {
// 		this.code = '';
// 		this.result = '';
// 		this.running = false;
// 		this.output_var = VarNameHandler.getNewVarName();
// 	}
// 	getHTML() {
// 		var code = new InputVariable('').getHTML();
// 		code.innerHTML = this.code;
// 		var result = document.createElement("div");
// 		result.className = 'result-div';
// 		result.innerHTML = this.result;
// 		var cell = document.createElement("div");
// 		cell.appendChild(code);
// 		cell.appendChild(document.createElement("br"));
// 		cell.appendChild(result);
// 		//cell.appendChild(document.createElement("br"));
// 		cell.className = 'cell-div';
// 		return cell;
// 	}
// }

// class InputVariable {
// 	constructor(name) {
// 		this.name = name;
// 	}
// 	setName(name) {
// 		this.name = name;
// 		this.name = this.name.split(/[ ,]+/)[0];
// 	}
// 	getName() {
// 		return this.name;
// 	}
// 	getHTML() {
// 		var div = document.createElement("input");
// 		div.type = 'text';
// 		div.placeholder = 'Input Variable';
// 		div.value = this.name;
// 		div.className = "input-var-div";
// 		return div;
// 	}
// }

// class Node {
// 	//constructor() {
// 	//	this.input_vars = [new InputVariable('')];
// 	//	this.title = '';
// 	//	this.output_cell = new Cell();
// 	//}
	
// 	constructor(title, input_vars, output_cell) {
// 		this.title = title;
// 		this.input_vars = input_vars;
// 		this.output_cell = output_cell;
// 	}

// 	//setTitle(title) {
// 	//	this.title = title;
// 	//}

// 	//getTitle() {
// 	//	return this.title;
// 	//}
// 	getHTML() {
// 		var node_div = document.createElement("div");
// 		var title_div = document.createElement("div");
// 		title_div.innerHTML = this.title;
// 		title_div.className = "title-div";
// 		node_div.appendChild(title_div);
// 		node_div.appendChild(document.createElement("br"));
// 		for (let i of this.input_vars) {
// 			node_div.appendChild(i.getHTML());
// 			node_div.appendChild(document.createElement("br"));
// 		}
// 		node_div.appendChild(this.output_cell.getHTML());
// 		node_div.className = "node-div";
// 		return node_div;
// 	}
// }

// function addNode(nodes, title, input_list, output_cell) {
// 	var node = new Node(title, input_list, output_cell).getHTML();
// 	makeDraggable(node);
// 	nodes.appendChild(node);
// }





function makeDraggable(node) {
  var deltax = 0, deltay = 0, x1 = 0, y1 = 0;
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




// add custom stylesheet
$('head').append('<link rel="stylesheet" href="/files/style.css">');

// add jquery ui
$('body').append('<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>');


// make cells draggable and resizable
$('.cell').draggable();
$('.cell').resizable();


// make floating cells opaque and in the same plane
$('.cell').css('background', 'white');
$('.cell').css('z-index', 1);
$('.cell').css('box-shadow', "black 0px 0px 10px 0px"); // add box shadow

// turn all the cells into floating movable nodes=
for (cell of $('.cell')) {
//     c = getCoords(cell); // get curent coordinates of the cell
//     cell.css('top', c[0]);
//     cell.css('left', c[1]);
    addPins(cell);
    addToolMenu(cell);
    const top1 = cell.offsetTop
    
    
    
    cell.addEventListener('mousedown', function(){
        // bring element to top when clicked
//         const top1 = $(this).css('top');
//         const left1 = $(this).css('left');
//         console.log(top1, left1);
        const c = [this.offsetTop, this.offsetLeft]//getCoords(this);
        console.log(c);
        $(this).parent().append($(this));
        $(this).css('position', 'absolute');
        $(this).css('top',   c[0]);
        $(this).css('left',  c[1]);
    });
}




// ncontainer.style.background = 'transparent';
// ncontainer.style.boxShadow = 'none';

$('#notebook-container').css('background', 'transparent');
$('#notebook-container').css('box-shadow', 'none');



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
