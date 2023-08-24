
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

// import * as React from 'react';

import { Widget } from '@lumino/widgets';
// import { UseSignal } from '@jupyterlab/ui-components';

import { Message } from '@lumino/messaging';

import { Signal } from '@lumino/signaling';

import { FlowDocModel, Position } from './model';

// import { FlowNode } from './flownode';

/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
export class FlowDocWidget extends DocumentWidget<
  FlowPanel,
  FlowDocModel
> {
  constructor(options: DocumentWidget.IOptions<FlowPanel, FlowDocModel>) {
    super(options);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this.content.dispose();
    super.dispose();
  }
}

/**
 * Widget that contains the main view of the DocumentWidget.
 */
export class FlowPanel extends Widget { //ReactWidget {
  /**
   * Construct a `FlowPanel`.
   *
   * @param context - The documents context.
   */
  constructor(context: DocumentRegistry.IContext<FlowDocModel>) {
    super();
    this.addClass('jp-flow-canvas');

    this._model = context.model;
    this._isDown = false;
    this._offset = { x: 0, y: 0 };
    this._clients = new Map<string, HTMLElement>();

    context.ready.then(value => {
      this._model.contentChanged.connect(this._onContentChanged);
      this._model.clientChanged.connect(this._onClientChanged);

      this._onContentChanged();

      console.log('nl', this._model.nodelist);
      console.log('nodes', this._model.nodelist.nodes);
      for (let fnode of this._model.nodelist.nodes) {
        this.node.appendChild(fnode.node);
      }
      this._model.nodelist.nodeAdded.connect((nodelist, nodeId) => {
        const fn = nodelist.get(nodeId);
        if (fn) {
          this.node.appendChild(fn.node);
        }
      })

      this.update();
    });

    //this._root = document.createElement('div');
    //this._root.className = 'jp-flow-root';
    this._onContentChanged();
    //this.node.appendChild(this._root)
  }

  // render() {
  //   // return Array.from(this._model.nodelist).map((fnode) => <fnode.render/>);
  //   return <UseSignal signal={this._signal}>
  //     {() => <div>
  //       {this._model.nodelist.length < 1 && (<p>Right click anywhere to start adding nodes</p>)}
  //       {this._model.nodelist.map(fnode => fnode.render())}
  //     </div>}
  //   </UseSignal>;
  // }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._model.contentChanged.disconnect(this._onContentChanged);
    Signal.clearData(this);
    super.dispose();
  }

  /**
   * Handle `after-attach` messages sent to the widget.
   *
   * @param msg Widget layout message
   */
  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.node.addEventListener('mousedown', this, true);
    this.node.addEventListener('mouseup', this, true);
    this.node.addEventListener('mouseenter', this, true);
    this.node.addEventListener('mouseleave', this, true);
    this.node.addEventListener('mousemove', this, true);
  }

  /**
   * Handle `before-detach` messages sent to the widget.
   *
   * @param msg Widget layout message
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('mousedown', this, true);
    this.node.removeEventListener('mouseup', this, true);
    this.node.removeEventListener('mouseenter', this, true);
    this.node.removeEventListener('mouseleave', this, true);
    this.node.removeEventListener('mousemove', this, true);
    super.onBeforeDetach(msg);
  }

  /**
   * Handle event messages sent to the widget.
   *
   * @param event Event on the widget
   */
  handleEvent(event: MouseEvent): void {
    if (event.type) {
      switch (event.type) {
        case 'mousedown':
          if (event.target === this.node) {
            if (event.button === 0) {
              event.preventDefault();
              event.stopPropagation();

              this._isDown = true;
              this._offset = {
                x: this._model.position.x - event.clientX,
                y: this._model.position.y - event.clientY
              };
            } else if (event.button === 2) {
              event.preventDefault();
              event.stopPropagation();

              const bbox = this.node.getBoundingClientRect();
              this._model.addNode(event.clientX - bbox.left, event.clientY - bbox.top);
              this.update();
            }
            break;
          }
        case 'mouseup':
          if (event.button === 0) {
            this._isDown = false;
          }
          break;
        case 'mouseenter':
          break;
        case 'mouseleave':
          // Wrapping the modifications to the shared model into a flag
          // to prevent apply changes triggered by the same client
          this._model.setCursor(null);
          break;
        case 'mousemove': {
          const bbox = this.node.getBoundingClientRect();
          // Wrapping the modifications to the shared model into a flag
          // to prevent apply changes triggered by the same client
          this._model.setCursor({
            x: event.x - bbox.left,
            y: event.y - bbox.top
          });

          if (this._isDown) {
            this._model.position = {
              x: event.clientX + this._offset.x,
              y: event.clientY + this._offset.y
            };
          }
          break;
        }
      }
    }
  }

  // /**
  //  * Callback to listen for changes to a given node in the list (or add it if necessary)
  //  */
  // private _onNodeUpdated = (idx): void => {
  // }
  /**
   * Callback to listen for changes on the model. This callback listens
   * to changes on shared model's content.
   */
  private _onContentChanged = (): void => {
    //this._root.style.left = this._model.position.x + 'px';
    //this._root.style.top = this._model.position.y + 'px';

    //this._root.innerText = this._model.content;
  };

  /**
   * Callback to listen for changes on the model. This callback listens
   * to changes on the different clients sharing the document.
   *
   * @param sender The DocumentModel that triggers the changes.
   * @param clients The list of client's states.
   */
  private _onClientChanged = (
    sender: FlowDocModel,
    clients: Map<number, any>
  ): void => {
    clients.forEach((client, key) => {
      if (this._model.clientId !== key) {
        const id = key.toString();

        if (client.mouse) {
          if (this._clients.has(id)) {
            const elt = this._clients.get(id)!;
            elt.style.left = client.mouse.x + 'px';
            elt.style.top = client.mouse.y + 'px';
          } else {
            const el = document.createElement('div');
            el.className = 'jp-flow-client';
            el.style.left = client.mouse.x + 'px';
            el.style.top = client.mouse.y + 'px';
            el.style.backgroundColor = client.user.color;
            el.innerText = client.user.name;
            this._clients.set(id, el);
            this.node.appendChild(el);
            
            
          }
        } else if (this._clients.has(id)) {
          this.node.removeChild(this._clients.get(id)!);
          this._clients.delete(id);
        }
      }
    });
  };

  private _isDown: boolean;
  private _offset: Position;
  //private _root: HTMLElement;
  private _clients: Map<string, HTMLElement>;
  private _model: FlowDocModel;
  // private _signal = new Signal<this, void>(this);
}
