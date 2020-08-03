
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
// 	dragElement(node);
// 	nodes.appendChild(node);
// }

// function from https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
//   if (document.getElementById(elmnt.id + "header")) {
//     // if present, the header is where you move the DIV from:
//     document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
//   } else {
//     // otherwise, move the DIV from anywhere inside the DIV:
//     elmnt.onmousedown = dragMouseDown;
//   }
  elmnt.onmousedown = dragMouseDown;
  elmnt.style.position = 'absolute';
  elmnt.style.width = '500px';

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function addPins(e) {
    
    function makePin(x, y) {
        var pin = document.createElement('div');
        pin.className = "node-pin";
        pin.style.top = -y + "px";
        pin.style.left = x + "px";
        return pin;
    }
    
    pin.className+=" output-node-pin";
    e.append(makePin(e.offsetWidth, e.offsetHeight));
}

//document.getElementById('notebook_panel').innerHTML = ''; // remove all the old ui

style = document.createElement('style');
style.setAttribute("href", "/files/style.css");
//style.type = "stylesheet";
document.head.append(style);

for (child of document.getElementById('notebook-container').children) {
    dragElement(child);
    addPins(child);
}

//document.getElementById('notebook-container').size = 10000000;

//addNode(document.getElementById('notebook_panel'), "test node", [new InputVariable("x"), new InputVariable("y")], new Cell()); // add new stuff

//alert("run");
