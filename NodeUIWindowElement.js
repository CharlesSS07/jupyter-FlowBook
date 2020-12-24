
class NodeUIElement extends UIElementIn {

  constructor(element) {
    this.element = element;
  }

  getElement() {
    return this.element;
  }

}

class NodeManagerHandlerIn {

  getNodeManager() {

  }

  setNodeManager() {

  }

}

class NodeManagerHandler extends NodeManagerHandlerIn {

  constructor(nm) {
    this.#nm = nm;
  }

  getNodeManager() {
    return this.#nm;
  }

  setNodeManager(nm) {
    this.#nm = nm;
  }

}

class TypeHandlerIn {

  getType() {

  }

  setType() {

  }

}

class TypeHandler extends TypeHandlerIn {

  constructor(type) {
    this.#type = type;
  }

  getType() {
    return this.#type;
  }

  setType(type) {
    this.#type = type;
  }

}

class TitleableElementIn {

  getTitle() {

  }

  setTitle(title) {

  }

  getInputElement() {

  }

}

class TitleableNodeElement extends TitleableElementIn, NodeManager, TypeHandler, NodeUIElement {

  constructor() {
    super();
    var cell = this.getCodeCell();
    var me = this;
    // make dropdown for selecting title
    const dropdown = $('<select>').addClass('code-format').addClass('node-title');
    const titleDiv = $('<input>').addClass('code-format').addClass('node-title');
    // dropdown.css('width', '50px');
    dropdown.on('mousedown', function() {
      // dropdown opened
      dropdown.empty();
      // remove all previous titles and add our title, then all others
      var currentTitle = me.getTitle();
      $('<option>').val(currentTitle).html(currentTitle).appendTo(dropdown);
      for (var e of me.getNodeManager().getTypes()) {
        // list all the titles that we can change type to
        var title = e.getTitle();
        if (title!=currentTitle) { // don't list this nodes title
          $('<option>').val(title).html(title).appendTo(dropdown);
        }
      }
    });
    dropdown.on('change', function(event) {
      // title was selected
      var currentTitle = me.getTitle();
      var title = me.getNodeManager().getType($(this).find("option:selected").text(), '# Type not found!');
      if (currentTitle!=title) {
        me.setType(title);
      }
      // remove all previous titles from dropdown
      dropdown.empty();
    });
    var originalColor = titleDiv.css('background-color');
    var errorColor = '#cc3300';
    titleDiv.on('focusin', function(e){
      // turn off edit mode so can type
      var cell = me.getCodeCell();
      cell.events.trigger('edit_mode.Cell', {cell:cell});
      // show the div
      // listDiv[0].classList.toggle('show');
      originalColor = titleDiv.css('background-color');
    });
    titleDiv.on('keyup', function(e) {
      // if this name is taken and this node is not already of that type
      if (FuncSpace.funcs.includes(titleDiv.val()) && me.getTitle()!=titleDiv.val()) {
        titleDiv.css('background-color', errorColor);
      } else {
        titleDiv.css('background-color', originalColor);
      }
    });
    titleDiv.on('focusout', function(e){
      titleDiv.val(me.setTitle(titleDiv.val()));
      titleDiv.placeholder = me.getTitle();
      titleDiv.css('background-color', originalColor);
      me.onSavingNode();
    });
    //titleDiv.prependTo(cell.element[0]);
    var div = $('<div>').addClass('code-format').addClass('node-title').append(dropdown).append(titleDiv);
    div.prependTo(this.getElement());
    this.#titleDiv = div;
  }

  getTitle() {
    return this.getType().getTitle();
  }

  setTitle(title) {
    return this.getType().setTitle(title);
  }

  getInputElement() {
    return this.#titleDiv.children(1);
  }

}

class WirePin {

  constructor() {

  }

  getInputField() {

  }

}

class WirePinableElementInterface extends NodeUIElement {

  constructor() {

  }

}

class NodeUIWindowElement extends CellUIWindowElementIn, TitleableElement, NodeUIElement {



}
