define(['base/js/namespace','base/js/events', 'require'], function(Jupyter, events, requirejs) {

  function main() {
    // attach custom stylesheet
    $('<link/>').attr('type', 'text/css').attr('rel', 'stylesheet').attr('href', requirejs.toUrl('./style.css')).appendTo('head');

    $('<script>').attr('src', requirejs.toUrl('./SaveAble.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./FuncSpace.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./Jupyter-Node.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./NodePinInput.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./NodeAddPinInputButton.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./NodeManager.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./NodePinOutput.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./NodeType.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./VarSpace.js')).appendTo('body');


    // overlay svg for drawing wires
    $('<svg height="100%" width="100%" style="pointer-events:none;top:0;right:0;position:absolute;" id="svg-layer"><g transform="scale(1,1)translate(0,0)" id="wire-layer"></g></svg>').appendTo($('#notebook'));

    //var dm = new DataManager('root', null);

    var nodeManager = new NodeManager($('#notebook'));//, dm.g('nodeManager'));

    // convert every existing cell to a node
    for (cell of Jupyter.notebook.get_cells().reverse()) {
      //nodeManager.newNode(cell);
      cellToNode(nodeManager, cell);
    }

    // convert newly created cells to nodes
    events.on('create.Cell', (event, data)=>{
      //nodeManager.getNewNodeInstance(data.cell);
      cellToNode(nodeManager, data.cell);
    });


    // zooming/panning around notebook
    loadView(); // load saved zoom/pan location
    //addPanListener(); // listen for mouse drags to pan around
    //addZoomListener(); // listen for scrolling to zoom
  }


  /**
  * converts a jupyter notebook cell to a node by making it draggable and resizable, and adding titles and nodes and metadata
  * @param cell_obj a jupyter notebook cell object
  * */
  function cellToNode(nodeManager, cell_obj) {
    var node = nodeManager.newNode(cell_obj);
  }


  /**
  * adds context menu of actions for a cell when right-clicked
  * @param cell an html .cell element in a jupyter notebook to have custom context menu added to
  * */
  function addToolMenu(cell) {
    cell.oncontextmenu = function (e) {
      e = e || window.event;
      if (!e.shiftKey) { // display normal context menu when shift key is held
        e.preventDefault();
        cell.click(); // select node
        $('#maintoolbar').css('display', 'inline-block');
        $('#maintoolbar').css('top', e.clientY + 'px');
        $('#maintoolbar').css('left', e.clientX + 'px');
        document.onclick = function () {
          $('#maintoolbar').css('display', 'none');
          document.onclick = null;
        };
      }
    };
  }


  /**
  * adds a name to a cell displayed at the top as a header of the cell
  * @param cell an html .cell element in a jupyter notebook to have a name header added to
  * */
  function addName(cell_obj) {
    const nameInput = $('<input>');
    nameInput.focusin(function(){
      // change to edit mode so keystrokes are not interpreted as commands
      cell_obj.events.trigger('edit_mode.Cell', {cell:cell_obj});
    });
    nameInput.on('input', function() {
      // edit the node name to value of text field
      // cell_obj.metadata.nodes.name = nameInput.val();
      nameInput.val(cell_obj.metadata.node.getType().setTitle(nameInput.val()));
    });
    nameInput.on('focusout', function() {
      nameInput.val(cell_obj.metadata.node.getType().setTitle(nameInput.val()));
    });
    // initial value is defined by node object
    nameInput.val(cell_obj.metadata.node.getType().getTitle());
    $('<div>').addClass('node-name').append(nameInput).prependTo(cell_obj.element);
  }

  // panning/zooming functionality

  /**
  * set initial view (zoom/pan location) from saved metadata
  * */
  function loadView() {
    if (!Jupyter.notebook.metadata.nodes) Jupyter.notebook.metadata.nodes = {};
    if (!Jupyter.notebook.metadata.nodes.view) Jupyter.notebook.metadata.nodes.view = {};
    $('#notebook-container').css('transform',  `matrix(
      ${Jupyter.notebook.metadata.nodes.view.zoom}, 0,
      0, ${Jupyter.notebook.metadata.nodes.view.zoom},
      ${Jupyter.notebook.metadata.nodes.view.left}, ${Jupyter.notebook.metadata.nodes.view.top})`);
    }



    /**
    * add event listener for mouse wheel scrolling on the background to zoom in/out on the notebook
    * */
    function addZoomListener() {
      function onZoom(e) {
        if (e.target.id == 'notebook') {
          const dzoom = (2**(-e.deltaY/500)); // multiply zoom by exponential of scroll to scale page by scroll amount
          Jupyter.notebook.metadata.nodes.view.zoom *= dzoom;
          $('#notebook-container').css('transform', `${$('#notebook-container').css('transform')} scale(${dzoom})`); // scale notebook
        }
      }
      document.addEventListener('mousewheel', onZoom);
      document.addEventListener('wheel', e=>{onZoom(e)});
    }

    function matrixToArray(str) {
      // extract parameters from string like 'matrix(1, 2, 3, 4, 5, 6)'
      return str.match(/(-?[0-9\.]+)/g);
    }





    main();
  });
