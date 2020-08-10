
class VarSpace {
	static c = 0;
	static global_space_var = "NodeSpace";
	static get_varname() {
		VarSpace.c+=1;
		return VarSpace.global_space_var+"["+VarSpace.c+"]"; // get the variable contained by the nodespace variable on the python side
	}
}

class FuncSpace {
	static c = 0;
	static global_space_var = "FuncSpace";
	static funcs = [];
	static get_funcname() {
		FuncSpace.c+=1;
		name = FuncSpace.global_space_var+".func_"+FuncSpace.c; // get the variable contained by the nodespace variable on the python side
		FuncSpace.funcs.push(name);
		return name
	}
}

class NodeInput {

	constructor(parentNode) {
		this.inputs = [];
		this.nameOutputLookup = {};
		this.wires = {};
		this.pins = {};
		this.parentNode = parentNode;
	}

	nextName(name) {
		return name+"_new";
	}

	addInputPin(name, pinElement) {
		if (this.inputs.includes(name)) {
			name = nextName(name);
			return addInputPin(name);
		} else {
			this.inputs.push(name)
			this.pins[name] = pinElement;
			return name;
		}
	}
	removeInputPin(name) {
		let i = this.inputs.indexOf(name);
		if (i==-1){
			throw "Pin Not found";
		} else {
			this.inputs.splice(i, 1);
		}
		if (Object.keys(this.nameOutputLookup).includes(name)) {
			delete this.nameOutputLookup[name];
		}
		if (Object.keys(this.pins).includes(name)) {
			delete this.pins[name];
		}
		if (Object.keys(this.wires).includes(name)) {
			delete this.wires[name];
		}
	}
	setInputName(i, newName) {
		if (newName==this.inputs[i]) {
			return newName;
		}
		if (this.inputs.includes(newName)) {
			return nextName(name);
		}
		this.inputs[i] = newName;
		return newName;
	}
	wire(name, output) {
		this.nameOutputLookup[name] = output;
		this.nameOutputLookup[name].addUser(this);
		this.wires[name] = $('<line style="stroke:rgb(255,0,0);stroke-width:10" />').attr('x1', 0).attr('y1', 0).attr('x2', 10).attr('y2', 10).appendTo('#wire-layer');
		this.updateWires();
	}
	updateWires() {
		for (var k in Object.keys(this.wires)) {
			let wire = this.wires[k];
			let output = this.nameOutputLookup[k];
			wire.setAttribute('x1', this.pins[i].offsetLeft);
			wire.setAttribute('y1', this.pins[i].offsetTop);
			let opin = output.getPin();
			wire.setAttribute('x2', opin.offsetLeft);
			wire.setAttribute('y2', opin.offsetTop);
		}
	}
	cutWire(name) {
		if (this.inputs.includes(name)){
			this.nameOutputLookup[name].removeUser(this);
			delete this.nameOutputLookup[name];
			delete this.wire[name];
		} else {
			throw "No pin named '"+name+"' in "+ this;
		}
	}
}

class NodeOutput {

	constructor(pinElement) {
		// tells python to put all output generated from this code into this variable
		this.varableName = VarSpace.get_varname();
		this.users = [];
		this.pin = pinElement;
	}

	addUser(user) {
		this.users.push(user)
	}

	removeUser(user) {
		i = this.users.indexOf(user);
		if (i==-1) {
			throw "NodeOutput: No record of this wire";
		} else {
			this.users.splice(i, 1);
		}
	}

	getUsers() {
		return this.users;
	}

	updateWires() {
		for (var u in this.users) {
			u.updateWires();
		}
	}

	getPin() {
		return this.pin;
	}

	setPin(pin) {
		this.pin = pin;
	}
}

class NodeData {

	constructor(type, pinElement) {
		//this.metadata ?
		this.inputs = new NodeInput(this);
		this.output = new NodeOutput(pinElement); // NodeOutput
		this.type = type; // things that are specific to this nodes type (function, title)
	}

	getInputs() {
		return this.inputs;
	}

	getOutput() {
		return this.output;
	}

	getType() {
		return this.type;
	}

	setType(type) {
		delete this.type;
		this.type = type;
	}

	moved() {
		this.redraw()
	}

	redraw() {
		this.inputs.updateWires();
	}

}

class NodeType {

	constructor(title, cell) {
		this.cell = cell; // cell to display, function to run on
		this.title = title; // title of this cell
		if (this.title==null) {
			this.title = FuncSpace.get_funcname();
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
		return cell;
	}

}

class NodeManager {

	constructor() {
		this.nodes = [];
		this.types = {};
	}

	newNode(cell, pinElement) {
		var type = this.newType(new NodeType(null, cell));
		var newnode = new NodeData(type, pinElement);
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

	getNodes() {
		return this.nodes;
	}
}

$('<svg height="100%" width="100%" style="top:0;right:0;position:absolute;"><g transform="scale(1,1)translate(0,0)" id="wire-layer"></g></svg>').prependTo($('#notebook'));
