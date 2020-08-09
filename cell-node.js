
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

	constructor() {
		this.inputs = [];
		this.wires = {};
	}

	onAddInputPin(name) {
		this.inputs.push(name)
	}
	onRemoveInputPin(i) {
		this.inputs.splice(i, 1);
	}
	onSetInputName(i, newName) {
		if (newName==this.inputs[i]) {
			return newName;
		}
		if (this.inputs.includes(newName)) {
			return this.onSetInputName(i, newName+"_duplicate");
		}
		this.inputs[i] = newName;
		return newName;
	}
	onSetInput(i, output) {
		this.wires[this.inputs[i]] = output;
		this.wires[this.inputs[i]].addUser(this);
	}
	onRemoveInput(i) {
		delete this.wires[this.inputs[i]];
	}
}

class NodeOutput {

	constructor() {
		// tells python to put all output generated from this code into this variable
		this.varableName = VarSpace.get_varname();
		this.users = {};
	}

	addUser(user) {
		this.users[user] = 1;
	}

	removeUser(user) {
		delete this.users[user];
	}

	getUsers() {
		return Object.keys(this.users);
	}
}

class NodeData {

	constructor(type) {
		//this.metadata??
		this.inputs = new NodeInput();
		this.output = new NodeOutput(); // NodeOutput
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

	newNode(cell) {
		var type = this.newType(new NodeType(null, cell));
		var newnode = new NodeData(type);
		this.nodes.push(newnode);
		return newnode;
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
