
class NodePinInput extends SaveAble {

  static INPUT_NODE_TYPE = 'input';
  constructor(parentNode) {
    super();
    this.name = '';
    this.sourceOutputVarName = null;
    this.parentNode = parentNode;
    this.inputDiv = null;
    this.makeInput();
    this.pin = null;
    this.makePin();
    this.div = null;
    this.makePinDiv();
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
      var cell = parentNode.getCodeCell();
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
      if (nameInput.val()!=me.getName()) {
        me.setName(parentNode.getAvaliableVarName(nameInput.val()));
      }

      nameInput.val(me.getName());
      nameInput.placeholder = me.getName();
      parentNode.onPinUnFocused(me);
      setSize();
      me.parentNode.onSavingNode();
    });
    this.inputDiv = nameInput;
    return nameInput;
  }

  makePin() {
    const pin = $('<div>').addClass(`node-pin`);
    var me = this;
    pin.on('mousedown', function(e) {
      e.preventDefault();
      // notify the node that this pin has been selected
      me.getParentNode().onPinSelected(me);
    });
    pin.on('mouseup', function(e) {
      e.preventDefault();
      // notify the node that this pin has been selected
      me.getParentNode().onPinSelected(me);
    });
    this.pin = pin;
    return pin;
  }

  makePinDiv() {
    var div = $('<div>').addClass('node-input');
    div.append(this.getPin());
    div.append(this.getField());
    this.div = div;
    return div;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
    this.getField().val(this.getName());
  }

  getOutput() {
    if (this.sourceOutputVarName){
      return this.parentNode.getNodeManager().getOutputByVarName(this.sourceOutputVarName);
    }
    return null;
  }

  setOutput(pinOutput) {
    if (!pinOutput) {
      return;
    }
    var oldout = this.getOutput();
    if (oldout) {
      this.getOutput().removeInput(this);
    }
    delete this.sourceOutputVarName;
    this.sourceOutputVarName = pinOutput.getOutputVariable();
    this.getOutput().addInput(this);
    if (this.wire) {
      this.wire.get().remove();
      this.wire = null;
    }
    var id = Math.random();

    var svgGroup = $('#wire-layer');
    this.wire = new SVGHelper('path', svgGroup);
    this.wire.get().classList.add('wire');
    this.updateWire();
  }

  updateWire() {
    var out = this.getOutput();
    if (out !== null) {
      var wire = this.getWire();
      if (wire) {
        var oPinOffset = out.getPin()[0].getBoundingClientRect();
        var iPinOffset = this.getPin()[0].getBoundingClientRect();
        var nbContainerOffset = document.getElementById('notebook').getBoundingClientRect();
        var Ix = nbContainerOffset.x;
        var Iy = nbContainerOffset.y;
        var ox = oPinOffset.x + (oPinOffset.width/2);
        var oy = oPinOffset.y + (oPinOffset.height/2);
        var ix = iPinOffset.x + (iPinOffset.width/2);
        var iy = iPinOffset.y + (iPinOffset.height/2);
        var x1 = ix-Ix;
        var y1 = iy-Iy;
        var x2 = ox-Ix;
        var y2 = oy-Iy;
        var midx = (x1+x2)/2;
        var precentile = 0.5;
        var precentilex1 = (x1+x2)/(1/precentile);
        var precentilex2 = (x1+x2)/(1/(1-precentile));
        this.wire.get().setAttribute('d', 'M '+x1+' '+y1+' C '+precentilex1+' '+y1+', '+precentilex2+' '+y2+', '+x2+' '+y2); // all the coordinates needed to draw a bezier
        //             M startx starty C supportx1 supporty1, supportx2 supporty2, endx, endy
        document.getElementById('svg-layer').innerHTML+=""; // weird hack to make svg update and show the new elements. I don't thinkg this needs to be done unless a new element is added
      }
    }
  }

  getWire() {
    if (this.wire) {
      return this.wire.get();
    }
    return null;
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

  getType() {
    return NodePinInput.INPUT_NODE_TYPE;
  }

  remove() {
    this.getPin()[0].remove();
    this.getField()[0].remove();
    this.makePinDiv()[0].remove();
  }

  onSerialize() {
    var obj = {};
    obj.name = this.getName();
    var o = this.getOutput();
    if (o) {
      obj.outputSourceVarName = o.getOutputVariable();
    } else {
      obj.outputSourceVarName = this.sourceOutputVarName;
    }
    return JSON.stringify(obj);
  }

  onDeserialize(string) {
    var obj = JSON.parse(string);
    if (!obj) {
      return this;
    }
    this.setName(obj.name);
    if (obj.outputSourceVarName) {
      this.sourceOutputVarName = obj.outputSourceVarName;
    }
    return this;
  }

}
