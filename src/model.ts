import { YDocument, DocumentChange } from '@jupyter/ydoc';

import { IChangedArgs } from '@jupyterlab/coreutils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { PartialJSONObject, PartialJSONValue } from '@lumino/coreutils';

import { ISignal, Signal } from '@lumino/signaling';

import * as Y from 'yjs';

//import { useGetUniqueKey } from "react-generate-unique-key-for-map";
import { v4 as uuidv4 } from 'uuid';

import { FlowNode, FlowNodeData } from './flownode';

/**
 * Document structure
 */
export type SharedObject = {
  x: number;
  y: number;
  nodelist: NodeList;//Map<string, FlowNode>;
  content: string;
};

/**
 * Position
 */
export type Position = {
  x: number;
  y: number;
};


export class NodeList {
  // TODO: add model (shared) to serialize
  // [key: string]: FlowNode;
  // static create(list: Array<FlowNodeData>, model: FlowDocModel, map: Y.Map<FlowNode>): NodeList {
  //   const nodelist = new NodeList(map);
  //   console.log('am a nodelist');
  //   console.log(nodelist.nodes);
  //   for (let nodeId in list) {
  //     nodelist.set(nodeId, FlowNode.create(list[nodeId], model));
  //   }

  //   return nodelist;
  // }
  constructor() { //map: Y.Map<FlowNodeData>
    this._nodemap = new Map<string, FlowNode>();//map;//new Y.Map<FlowNode>();
  }
  load(obj: {[key: string]: FlowNodeData}, model: FlowDocModel) {
    this._nodemap = new Map((Object.keys(obj)).map((key: string) => [key, FlowNode.create(obj[key], model)]));
  }

  get(key: string): FlowNode | undefined {
    return this._nodemap.get(key);
  }

  set(nodeId: string, val: FlowNode) {
    const _prev = this._nodemap.get(nodeId);
    if (_prev) {
      _prev.remove();
    }
    this._nodemap.set(nodeId, val);
    this._nodeAdded.emit(nodeId);
  }

  add(val: FlowNode) {
    const nodeId = this.newNodeId();  //this.newUniqueNodeId(fnode);
    this.set(nodeId, val);
  }

  toJSON(): Object {
    return Object.fromEntries(this._nodemap.entries());
  }
  toString(): string {
    return JSON.stringify(this.toJSON());
  }


  newNodeId() {
    let id: string;
    do {
      id = uuidv4();
    } while (this._nodemap.has(id))
    return id;
    // while (this._maxnodeid in this.nodelist) {
    //   this._maxnodeid += 1;
    // }
    // return this._maxnodeid;
  }

  // [Symbol.iterator]() {

  // }
  get nodes(): IterableIterator<FlowNode> {
    return this._nodemap.values();
  }

  // get y(): Y.Map<FlowNodeData> {
  //   return this._nodemap;
  // }
  get nodeAdded(): ISignal<this, string>{
    return this._nodeAdded;
  }

  private _nodemap: Map<string, FlowNode>;
  private _nodeAdded = new Signal<this, string>(this);
  // private _maxnodeid
}



/**
 * DocumentModel: this Model represents the content of the file
 */
export class FlowDocModel implements DocumentRegistry.IModel {
  /**
   * Construct a new FlowDocModel.
   *
   * @param options The options used to create a document model.
   */
  constructor(options: DocumentRegistry.IModelOptions<FlowDoc>) {
    const { collaborationEnabled, sharedModel } = options;
    this._collaborationEnabled = !!collaborationEnabled;
    if (sharedModel) {
      this.sharedModel = sharedModel;
    } else {
      this.sharedModel = FlowDoc.create();
    }

    // Listening for changes on the shared model to propagate them
    this.sharedModel.changed.connect(this._onSharedModelChanged);
    this.sharedModel.awareness.on('change', this._onClientChanged);
  }

  /**
   * Whether the model is collaborative or not.
   */
  get collaborative(): boolean {
    return this._collaborationEnabled;
  }

  /**
   * The default kernel name of the document.
   *
   * #### Notes
   * Only used if a document has associated kernel.
   */
  readonly defaultKernelName = '';

  /**
   * The default kernel language of the document.
   *
   * #### Notes
   * Only used if a document has associated kernel.
   */
  readonly defaultKernelLanguage = '';

  /**
   * The dirty state of the document.
   *
   * A document is dirty when its content differs from
   * the content saved on disk.
   */
  get dirty(): boolean {
    return this._dirty;
  }
  set dirty(newValue: boolean) {
    const oldValue = this._dirty;
    if (newValue === oldValue) {
      return;
    }
    this._dirty = newValue;
    this.triggerStateChange({
      name: 'dirty',
      oldValue,
      newValue
    });
  }

  /**
   * Whether the model is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * The read only state of the document.
   */
  get readOnly(): boolean {
    return this._readOnly;
  }
  set readOnly(newValue: boolean) {
    if (newValue === this._readOnly) {
      return;
    }
    const oldValue = this._readOnly;
    this._readOnly = newValue;
    this.triggerStateChange({ name: 'readOnly', oldValue, newValue });
  }

  /**
   * The shared document model.
   */
  readonly sharedModel: FlowDoc = FlowDoc.create();

  /**
   * The client ID from the document
   *
   * ### Notes
   * Each browser sharing the document will get an unique ID.
   * Its is defined per document not globally.
   */
  get clientId(): number {
    return this.sharedModel.awareness.clientID;
  }

  /**
   * Shared object content
   */
  // get content(): string {
  //   return this.sharedModel.get('content');
  // }
  // set content(v: string) {
  //   this.sharedModel.set('content', v);
  // }

  /**
   * Shared object position
   */
  get position(): Position {
    return this.sharedModel.get('position');
  }
  set position(v: Position) {
    this.sharedModel.set('position', v);
  }

  /**
   * list of flow nodes
   */
  get nodelist(): NodeList {//FlowNode[] { // Map<string, FlowNode>
    // console.log(this.sharedModel.get('nodelist'));
    // console.log(this.sharedModel.get('nodelist').nodes);
    return this.sharedModel.nodes;//get('nodelist');
  }
  // set nodelist(nl: NodeList) { // Map<string, FlowNode> // FlowNode[]
  //   this.sharedModel.set('nodelist', nl);
  // }

  /**
   * get the signal clientChanged to listen for changes on the clients sharing
   * the same document.
   *
   * @returns The signal
   */
  get clientChanged(): ISignal<this, Map<number, any>> {
    return this._clientChanged;
  }

  /**
   * A signal emitted when the document content changes.
   *
   * ### Notes
   * The content refers to the data stored in the model
   */
  get contentChanged(): ISignal<this, void> {
    return this._contentChanged;
  }

  /**
   * A signal emitted when the document state changes.
   *
   * ### Notes
   * The state refers to the metadata and attributes of the model.
   */
  get stateChanged(): ISignal<this, IChangedArgs<any>> {
    return this._stateChanged;
  }

  /**
   * Dispose of the resources held by the model.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    Signal.clearData(this);
  }

  /**
   * Sets the mouse's position of the client
   *
   * @param pos Mouse position
   */
  setCursor(pos: Position | null): void {
    // Adds the position of the mouse from the client to the shared state.
    this.sharedModel.awareness.setLocalStateField('mouse', pos);
  }

  /**
   * add flow node to nodelist
   */
  addNode(x: number, y: number) {
    const fnode = new FlowNode(this); //{model: this, func: '', pos: {x:x,y:y}, inputs: [], outputs: []};
    fnode.pos = {x: x, y: y};
    // const nodeId = this.newNodeId(); //uuidv4(); //this.newUniqueNodeId(fnode);
    // const nl = this.sharedModel.get('nodelist');

    this.nodelist.add(fnode);//set(nodeId, fnode);
    // this.sharedModel.set('nodelist', this.nodelist);
  }


  /**
   * generate a new unique ID for a new node
   */
  // newFNID() {
    // const nodelist = this.sharedModel.get('nodelist');
    // let id = 0;
    // for (let fnode of nodelist) {
      // 
    // }
  // }

  /**
   * Should return the data that you need to store in disk as a string.
   * The context will call this method to get the file's content and save it
   * to disk
   *
   * @returns The data
   */
  toString(): string {
    const pos = this.sharedModel.get('position');
    const obj = {
      x: pos?.x ?? 10,
      y: pos?.y ?? 10,
      nodelist: this.sharedModel.nodes.toJSON(), //{},//new Map<string, FlowNode>(),
      // content: this.sharedModel.get('content') ?? ''
    };
    console.log('nodes', this.sharedModel.nodes);
    console.log(obj);
    console.log('stringed', JSON.stringify(obj));
    return JSON.stringify(obj, null, 2);
  }

  /**
   * The context will call this method when loading data from disk.
   * This method should implement the logic to parse the data and store it
   * on the datastore.
   *
   * @param data Serialized data
   */
  fromString(data: string): void {
    const obj = JSON.parse(data);

    this.sharedModel.transact(() => {
      this.sharedModel.set('position', { x: obj.x, y: obj.y });
      // this.sharedModel.set('content', obj.content);
      this.sharedModel.nodes.load(obj.nodelist, this);
      // this.sharedModel.set('nodelist', NodeList.create(obj.nodelist, this));
    });
  }

  /**
   * Serialize the model to JSON.
   *
   * #### Notes
   * This method is only used if a document model as format 'json', every other
   * document will load/save the data through toString/fromString.
   */
  toJSON(): PartialJSONValue {
    return JSON.parse(this.toString() || 'null');
  }

  /**
   * Deserialize the model from JSON.
   *
   * #### Notes
   * This method is only used if a document model as format 'json', every other
   * document will load/save the data through toString/fromString.
   */
  fromJSON(value: PartialJSONValue): void {
    this.fromString(JSON.stringify(value));
  }

  /**
   * Initialize the model with its current state.
   */
  initialize(): void {
    return;
  }

  /**
   * Trigger a state change signal.
   */
  protected triggerStateChange(args: IChangedArgs<any>): void {
    this._stateChanged.emit(args);
  }

  /**
   * Trigger a content changed signal.
   */
  protected triggerContentChange(): void {
    this._contentChanged.emit(void 0);
    this.dirty = true;
  }

  /**
   * Callback to listen for changes on the sharedModel. This callback listens
   * to changes on the different clients sharing the document and propagates
   * them to the DocumentWidget.
   */
  private _onClientChanged = () => {
    const clients = this.sharedModel.awareness.getStates();
    this._clientChanged.emit(clients);
  };

  /**
   * Callback to listen for changes on the sharedModel. This callback listens
   * to changes on shared model's content and propagates them to the DocumentWidget.
   *
   * @param sender The sharedModel that triggers the changes.
   * @param changes The changes on the sharedModel.
   */
  private _onSharedModelChanged = (
    sender: FlowDoc,
    changes: FlowDocChange | NodeChangeList
  ): void => {
    if (changes.contentChange || changes.positionChange) {
      this.triggerContentChange();
    }
    if (changes.stateChange) {
      changes.stateChange.forEach(value => {
        if (value.name === 'dirty') {
          // Setting `dirty` will trigger the state change.
          // We always set `dirty` because the shared model state
          // and the local attribute are synchronized one way shared model -> _dirty
          this.dirty = value.newValue;
        } else if (value.oldValue !== value.newValue) {
          this.triggerStateChange({
            newValue: undefined,
            oldValue: undefined,
            ...value
          });
        }
      });
    }
  };

  private _dirty = false;
  private _isDisposed = false;
  private _readOnly = false;
  private _clientChanged = new Signal<this, Map<number, any>>(this);
  private _contentChanged = new Signal<this, void>(this);
  private _collaborationEnabled: boolean;
  private _stateChanged = new Signal<this, IChangedArgs<any>>(this);
}

/**
 * Type representing the changes on the sharedModel.
 *
 * NOTE: Yjs automatically syncs the documents of the different clients
 * and triggers an event to notify that the content changed. You can
 * listen to this changes and propagate them to the widget so you don't
 * need to update all the data in the widget, you can only update the data
 * that changed.
 *
 * This type represents the different changes that may happen and ready to use
 * for the widget.
 */
export type FlowDocChange = {
  contentChange?: string;
  positionChange?: Position;
} & DocumentChange;


export type NodeChangeList = {
  [key: string]: FlowNodeData
} & DocumentChange;

/**
 * SharedModel, stores and shares the content between clients.
 */
export class FlowDoc extends YDocument<FlowDocChange | NodeChangeList> {
  constructor() {
    super();
    // Creating a new shared object and listen to its changes
    this._content = this.ydoc.getMap('content');
    // this._content.observe(this._contentObserver);
    this._nodes = new NodeList();//this.ydoc.getMap('nodes'));
    // this._nodes.y.observe(this._nodeListObserver);
  }

  readonly version: string = '1.0.0';

  /**
   * Dispose of the resources.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    // this._content.unobserve(this._contentObserver);
    // this._nodes.y.unobserve(this._nodeListObserver);
    super.dispose();
  }

  /**
   * Static method to create instances on the sharedModel
   *
   * @returns The sharedModel instance
   */
  static create(): FlowDoc {
    return new FlowDoc();
  }

  /**
   * Returns an the requested object.
   *
   * @param key The key of the object.
   * @returns The content
   */
  get(key: 'content'): string;
  get(key: 'position'): Position;
  get(key: string): any {
    const data = this._content.get(key);
    if (key === 'position') {
      return data
        ? JSON.parse(data)
        : { x: 0, y: 0 };
    } else {
      return data ?? '';
    }
    
  }

  /**
   * Adds new data.
   *
   * @param key The key of the object.
   * @param value New object.
   */
  // set(key: 'content', value: string): void;
  set(key: 'position', value: PartialJSONObject): void;
  set(key: string, value: string | PartialJSONObject | Object): void {
    if (key === 'position') {
      this._content.set(key, JSON.stringify(value));
    } else {
      this._content.set(key, value);
    }
  }

  /**
   * Handle a change.
   *
   * @param event Model event
   */
  // private _contentObserver = (event: Y.YMapEvent<any>): void => {
  //   const changes: FlowDocChange = {};

  //   // Checks which object changed and propagates them.
  //   if (event.keysChanged.has('position')) {
  //     changes.positionChange = JSON.parse(this._content.get('position'));
  //   }

  //   if (event.keysChanged.has('content')) {
  //     changes.contentChange = this._content.get('content');
  //   }

  //   this._changed.emit(changes);
  // };

  // private _nodeListObserver = (event: Y.YMapEvent<any>): void => {
  //   const changes: NodeChangeList = {};
  //   console.log('change', event);
  //   this._changed.emit(changes);
  // }

  get nodes(): NodeList {
    return this._nodes;
  }

  private _content: Y.Map<any>;
  private _nodes: NodeList;
}
