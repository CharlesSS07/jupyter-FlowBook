Ideas for feature/fixes to implement:
 * make links deletable
 * call update of node type on all nodes of specified type
 * make a built in cacheing node (probably use npy save format or some pickled)
 * highlight wires connectin to nodes
  * orange for currently selected
  * darker oragne for previously selected
  * another color for previously previously selected
  * ... all the way to blue
 * do zoom correctly
 * pan to slected nodes button to avoid getting lost
 * input slector (easy way to select what output to put int this input)
  * based on recent, distance from this input, fartherst pins, most likely pins ...
 * automatically split tuple into multiple output pins, maybe use python dictionary to avoid mixups
 * make new nodes appear in center of screen
 * traverse node tree and focus on selected node with arrow keys, left/right: next node. up/down: other input/output pin?
 * make nodes exectute unless result is already cached if a node downstream node needs the result
