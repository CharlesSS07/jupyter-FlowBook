
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
      me.setName(parentNode.getAvaliableVarName(nameInput.val()));
      nameInput.val(me.getName());
      nameInput.placeholder = me.getName();
      parentNode.onPinUnFocused(me);
      setSize();
      this.computeWire();
    });
    return nameInput;
  }

  makePin() {
    const pin = $('<div>').addClass(`node-pin`);
    var me = this;
    pin.on('mousedown', function(e) {
      console.log("selected");
      e.preventDefault();
      // notify the node that this pin has been selected
      me.getParentNode().onPinSelected(me);
    });
    pin.on('mouseup', function(e) {
      console.log("selected");
      e.preventDefault();
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
    this.getOutput().addInput(this);
    //this.wire = $('<line style="stroke:rgb(128,128,128,128);stroke-width:6" />').attr('x1', 0).attr('y1', 0).attr('x2', 100).attr('y2', 100).appendTo('#wire-layer');
    if (this.wire !== null) {
      console.log('removing', this.wire);
      document.getElementById(this.wire).remove();
    }
    // id="'+this.getOutput().getOutputVariable()+'"
    var id = Math.random();

    this.computeWire();
    var path = $('<path id="'+this.wire+'" />')[0];
    path.classList.add('wire');
    document.getElementById('wire-layer').append(path);
    this.updateWire();
  }

  updateWire() {
    //console.log(this.getOutput());
    var out = this.getOutput();
    if (out !== null) {
      var wire = this.getWire();
      console.log(this.wire);
      if (wire) {
        console.log('Updating wire position');
        //console.log(out.getPin());
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
        var precentile = 0.5;
        var precentilex1 = (x1+x2)/(1/precentile);
        var precentilex2 = (x1+x2)/(1/(1-precentile));
        //this.wire.attr('d', '');
        console.log(wire.getAttribute( 'd'));
        wire.setAttribute('d', 'M '+x1+' '+y1+' C '+precentilex1+' '+y1+', '+precentilex2+' '+y2+', '+x2+' '+y2); // all the coordinates needed to draw a bezier
        console.log(wire.getAttribute('d'));
        //             M startx starty C supportx1 supporty1, supportx2 supporty2, endx, endy
        document.getElementById('svg-layer').innerHTML+=""; // weird hack to make svg update and show the new elements. I don't thinkg this needs to be done unless a new element is added
      }
    }
  }

  getWire() {
    return document.getElementById(this.wire);
  }

  computeWire() {
    if (this.wire) {
      document.getElementById(this.wire).remove();
    }
    this.wire = this.wire = "wires/"+this.getOutput().getOutputVariable()+'/'+this.getParentNode().getType().getTitle()+'/'+this.getParentNode().getNodeManager().getNodeIndex(this)+'/'+this.getName();
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

  getDiv() {
    var div = $('<div>').addClass('node-input');
    div.append(this.getPin());
    div.append(this.getField());
    return div;
  }

  getType() {
    return NodePinInput.INPUT_NODE_TYPE;
  }

  remove() {
    this.getPin()[0].parentNode.remove();
  }

}
