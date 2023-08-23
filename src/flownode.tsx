import { Position, FlowDocModel } from './model';

import * as React from 'react';
import { FlowInputPin } from './flowpin';

// import { CodeCell } from '@jupyterlab/cells';
import { CodeEditor } from '@jupyterlab/codeeditor';
// import { IModel } from '@jupyterlab/codeeditor/CodeEditor';
import { CodeMirrorEditor } from '@jupyterlab/codemirror';

import { Widget } from '@lumino/widgets';
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

const flowNodeStyle: React.CSSProperties = {
  position: 'absolute',
  display: 'inline-block',
  background: 'white',
  borderRadius: '5px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
};

const flowPinStyle: React.CSSProperties = {
  width: '1rem',
  height: '1rem',
  borderRadius: '100%',
  color: 'grey'
};

export class FlowNode {

  constructor(model: FlowDocModel) {
    this._model = model;

    this._pos = {x: 0, y: 0};

    this._function = '';

    // this.id = this.model.newFNID();

    this._inputs = [];
    
    this._outputs = [];

    this._widget = new Widget();

    this._editormodel = new CodeEditor.Model({id: 'mycodeeditor', mimeType: 'python'});
    this._editor = new CodeMirrorEditor({host: this.widget.node, model: this._editormodel}); this._editor;
    
    console.log('FlowNode construct');
    console.log(this._editor);
    console.log(this.widget.node);
    // console.log(this.content);
    // console.log(this.changed);
  }

  toJSON() {
    return {
      func: this.function,
      inputs: this.inputs,
      outputs: this.outputs,
      pos: this.pos
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
  }
  public get function(): string {
    return this._function;
  }
  public set function(value: string) {
    this._function = value;
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
  public get widget(): Widget {
    return this._widget;
  }
  public set widget(w: Widget) {
    this._widget = w;
  }
  private _model: FlowDocModel;
  private _pos: Position;
  private _function: string;
  private _inputs: Array<FlowInputPin>;
  private _outputs: Array<Object>
  private _editormodel: CodeEditor.IModel;
  private _editor: CodeMirrorEditor;
  private _widget: Widget;
}