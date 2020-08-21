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
    $('<script>').attr('src', requirejs.toUrl('./SVGHelper.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./NodeBackground.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./PanZoomElement.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./SVGPanZoomElement.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./CSSPanZoomElement.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./Wire.js')).appendTo('body');
    $('<script>').attr('src', requirejs.toUrl('./WireCurvy.js')).appendTo('body');


    // overlay svg for drawing wires
    $('<svg height="100%" width="100%" style="pointer-events:none;top:0;right:0;position:absolute;" id="svg-layer" class="svg-shadow"><g transform="scale(1,1)translate(0,0)" id="wire-layer"></g></svg>').prependTo($('#notebook'));

    if (!Jupyter.notebook.metadata.nodes) Jupyter.notebook.metadata.nodes = {};

    var nodeManager = new NodeManager($('#notebook'));

    // convert every existing cell to a node
    for (cell of Jupyter.notebook.get_cells().reverse()) {
      if (cell.metadata.nodes) {
        nodeManager.loadNode(cell);
      } else {
        nodeManager.newNode(cell);
      }
    }
    setTimeout(function() {nodeManager.postLoad()}, 500);

    var init_cell = Jupyter.notebook.insert_cell_above();
    // python backend will create the variable in VarSpace.global_space_var if it is not already in existance
    init_cell.set_text('import datetime\nif \''+VarSpace.global_space_var+'\' not in vars():\n  '+VarSpace.global_space_var+' = {}\n'+VarSpace.global_space_var+'\nprint("Initialized Backend Successfully on "+datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))');
    init_cell.execute();
    init_cell.element[0].style.width = "500px";
    setTimeout(function() {
      Jupyter.notebook.delete_cell(Jupyter.notebook.get_cells().indexOf(init_cell));
    }, 4000);
    // convert newly created cells to nodes
    events.on('create.Cell', (event, data)=>{
      //nodeManager.getNewNodeInstance(data.cell);
      var node = nodeManager.newNode(data.cell);
    });

    var wirePanZoomElement = new SVGPanZoomElement($('#wire-layer'));
    wirePanZoomElement.setNodeManager(nodeManager);

    var nodeBackground = new NodeBackground($('#notebook-container'), [new CSSPanZoomElement($('#notebook-container')), wirePanZoomElement]);

    // zooming/panning around notebook
    nodeBackground.loadView(); // load saved zoom/pan location
    nodeBackground.addPanListener(); // listen for mouse drags to pan around
    //addZoomListener(); // listen for scrolling to zoom



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
