import { Position, FlowDocModel } from './model';

//import * as React from 'react';
import { FlowInputPin } from './flowpin';

// import { CodeCell } from '@jupyterlab/cells';
import { CodeEditor } from '@jupyterlab/codeeditor';
// import { IModel } from '@jupyterlab/codeeditor/CodeEditor';
import { CodeMirrorEditor } from '@jupyterlab/codemirror';

import { Widget } from '@lumino/widgets';

// import { PartialJSONValue } from '@lumino/coreutils';

// console.log(CodeCell.IOptions.ContentFactory);
// console.log(IOptions.ContentFactory.editorFactory);

// const CM = new CodeCell({});

// const CellElement = CM.contentFactory.editorFactory({});

// CodeMirrorEditorFactory
// const CM = new CodeCellModel();

// export function renderFlowNode(fnode: FlowNode) {
//   const cem = new CodeEditor.Model({id: 'mycodeeditor', mimeType: 'python'});
//   const editor = new CodeMirrorEditor({host: new HTMLElement(), model: cem});
//   return <div className='flownode' style={{...flowNodeStyle, top: fnode.pos.y, left: fnode.pos.x}}>
//     {fnode.inputs.length < 1 || (
//       <div className='flowinput'>
//         <div className='flowinpin' data-connected={false} style={flowPinStyle}></div>
//         <div className='flowinpinvarname'>connect here!</div> 
//       </div>
//     )}
//     {fnode.inputs.map(input => 
//       <div className='flowinput'>
//         <div className='flowinpin' data-connected={input.source !== null} style={flowPinStyle}></div>
//         <div className='flowinpinvarname'>{input.varname}</div> 
//       </div>
//     )}
//     <textarea onInput={console.log}></textarea>
//     {
//       // <CM/>
//       // <cem.widget/>
//       editor.host
//     }
//     { 
//       <div className='flowoutput'>
//         <div className='flowoutpin' data-connected={fnode.outputs.length > 0} style={flowPinStyle}></div>
//         <div className='flowoutputtext'>out</div> 
//       </div>
//     }
//   </div>
// }

// export type FlowNode = {
//   model: FlowDocModel;
//   pos: Position;
//   func: string;
//   inputs: Array<FlowInputPin>;
//   outputs: Array<object>;
// };

// const flowNodeStyle: React.CSSProperties = {
//  position: 'absolute',
//  display: 'inline-block',
//  background: 'white',
//  borderRadius: '5px',
//  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
// };

// const flowPinStyle: React.CSSProperties = {
//  width: '1rem',
//  height: '1rem',
//  borderRadius: '100%',
//  color: 'grey'
// };


// the information a serialized object needs 
export type FlowNodeData = {
  func: string;
  pos: Position;
  inputs: Array<any>;
  outputs: Array<any>;
}

export class FlowNode extends Widget {

  constructor(model: FlowDocModel) {
    super();

    this._elem = document.createElement('div');
    this._elem.className = 'jp-flownode';

    const draghandle = document.createElement('div');
      draghandle.className = 'flownode-draghandle';
      const closebutton = document.createElement('div');
        closebutton.className = 'flownode-close-button';
        closebutton.addEventListener('mousedown', e=>{if (e.target == closebutton) {this.remove()}});
      draghandle.addEventListener('mousedown', e=>this._beginDrag(e));
      draghandle.appendChild(closebutton);
    this._elem.appendChild(draghandle);

    const inputsdiv = document.createElement('div');
      inputsdiv.className = 'flownode-inputs';
      const callinput = document.createElement('span');
        callinput.className = 'flownode-input-pin';
      inputsdiv.appendChild(callinput);
      const addinput = document.createElement('div');
        addinput.className = 'flownode-add-pin-button';
      inputsdiv.appendChild(addinput);
    this._elem.appendChild(inputsdiv);

    this._editorElem = document.createElement('div');
      this._editorElem.className = 'flownode-codeeditor';
    this._elem.appendChild(this._editorElem);

    this.node.appendChild(this._elem);
    this.node.setAttribute('style', 'overflow: visible');

    this._editormodel = new CodeEditor.Model({id: 'mycodeeditor', mimeType: 'python'});
    this._editor = new CodeMirrorEditor({host: this._editorElem, model: this._editormodel});
    console.log(this._editor);


    this._model = model;

    this.function = '';

    this.inputs = [];
    
    this.outputs = [];

    // this._widget = new Widget();
    
    
    this._editormodel.sharedModel.changed.connect(this._onEditorInput);
  }

  static create(data: FlowNodeData, model: FlowDocModel) {
    const fnode = new FlowNode(model);

    fnode.function = data.func;
    fnode.inputs = data.inputs;
    fnode.outputs = data.outputs;
    fnode.pos = data.pos;

    return fnode;
  }

  remove(): void {
    this.node.remove();
  }


  toJSON(): FlowNodeData {
    return {
      func: this.function,
      inputs: this.inputs,
      outputs: this.outputs,
      pos: this.pos
    }
  }

  /**
   * The context will call this method when loading data from disk.
   * This method should implement the logic to parse the data and store it
   * on the datastore.
   *
   * @param data Serialized data
   */
  // fromString(data: string): void {
  //   const obj = JSON.parse(data);
  //   this._function = obj.func;
  //   this._inputs = obj.inputs;
  //   this._outputs = obj.outputs;
  //   this._pos = obj.pos;
  // }

  /**
   * Deserialize the model from JSON.
   *
   * #### Notes
   * This method is only used if a document model as format 'json', every other
   * document will load/save the data through toString/fromString.
   */
  // fromJSON(value: PartialJSONValue): void {
  //   this.fromString(JSON.stringify(value));
  // }
  

  // private _onChanged = (changes: Object) => {

  // }


  private _onEditorInput = (sender: any, changes: any) => {
    console.log('sender');
    console.log(sender);
    console.log(changes);
  }

  private _beginDrag = (event: MouseEvent) => {
    if (event.button == 0) {
      event.preventDefault();
      event.stopPropagation();
      // const bbox = this.node.getBoundingClientRect();
      const offset = {
        x: - this.pos.x + event.clientX,
        y: - this.pos.y + event.clientY
      }
      document.onmousemove = (e: MouseEvent) => {
        this.pos = {
          x: e.clientX - offset.x,
          y: e.clientY - offset.y
        };
      };
      document.onmouseup = function(e: MouseEvent) {
        document.onmousemove = null;
      }
    }
  }

  // render() {
  //   const fnode = this;
  //   return <div className='flownode' style={{...flowNodeStyle, top: fnode.pos.y, left: fnode.pos.x}}>
  //     {fnode.inputs.length < 1 || (
  //       <div className='flowinput'>
  //         <div className='flowinpin' data-connected={false} style={flowPinStyle}></div>
  //         <div className='flowinpinvarname'>connect here!</div> 
  //       </div>
  //     )}
  //     {fnode.inputs.map(input => 
  //       <div className='flowinput'>
  //         <div className='flowinpin' data-connected={input.source !== null} style={flowPinStyle}></div>
  //         <div className='flowinpinvarname'>{input.varname}</div> 
  //       </div>
  //     )}
  //     <textarea onInput={console.log}></textarea>
  //     { 
  //       <div className='flowoutput'>
  //         <div className='flowoutpin' data-connected={fnode.outputs.length > 0} style={flowPinStyle}></div>
  //         <div className='flowoutputtext'>out</div> 
  //       </div>
  //     }
  //   </div>
  // }
  public get model(): FlowDocModel {
    return this._model;
  }
  public set model(value: FlowDocModel) {
    this._model = value;
  }
  public get pos(): Position {
    return this._pos;
  }
  public set pos(value: Position) {
    this._pos = value;
    this._elem.setAttribute('style', `top: ${this._pos.y}px; left: ${this._pos.x}px`);
    // this._elem.setAttribute('left', this._pos.y.toString());
    // this.update();
  }
  public get function(): string {
    return this._function;
  }
  public set function(value: string) {
    this._function = value;

    this._editormodel.sharedModel.setSource(value);
  }
  // private id: string;
  public get inputs(): Array<FlowInputPin> {
    return this._inputs;
  }
  public set inputs(value: Array<FlowInputPin>) {
    this._inputs = value;
  }
  public get outputs(): Array<Object> {
    return this._outputs;
  }
  public set outputs(value: Array<Object>) {
    this._outputs = value;
  }
  // public get widget(): Widget {
  //   return this._widget;
  // }
  // public set widget(w: Widget) {
  //   this._widget = w;
  // }
  private _model: FlowDocModel;
  private _pos: Position = {x:0, y:0};
  private _function: string = '';
  private _inputs: Array<FlowInputPin> = [];
  private _outputs: Array<Object> = [];
  private _editormodel: CodeEditor.IModel;
  private _editor: CodeMirrorEditor;
  private _elem: HTMLElement;
  private _editorElem: HTMLElement;
  // private _widget: Widget;
}
