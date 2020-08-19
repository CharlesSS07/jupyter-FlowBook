
class NodeAddPinInputButton extends NodePinInput {

  makeInput() {
    const nameInput = super.makeInput();
    nameInput.placeholder = '+';
    var me = this;
    nameInput.off('focusin'); //remove the behaviors that super added
    nameInput.on('focusin', function(){
      var parentNode = me.getParentNode();
      var newInput = parentNode.addInputPin();
      newInput.getField().focus();
    });
    nameInput.off('focusout'); //remove the behaviors that super added
    return nameInput;
  }

  makePin() {
    // make inactive pin that dosen't respond to normal events so wont interfere
    const nameInput = super.makePin().addClass('inactive-pin').off();
    return nameInput;
  }

  getType() {
    return 'possibleInput';
  }

  onSerialize() {
    var obj = {};
    obj.name = '';
    obj.wire = '';
    return JSON.stringify(obj);
  }

}
