
import { YNotebook, ISharedNotebook, YCodeCell, YMap } from '@jupyter/ydoc';

import { NotebookModel, NotebookPanel, CellList, NotebookActions } from '@jupyterlab/notebook';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { CodeViewerWidget } from '@jupyterlab/codeeditor';

export class FlowBookModel extends NotebookModel {

    constructor(options?: DocumentRegistry.IModelOptions<ISharedNotebook>) {
        super(options);
    }

    private _cells: NodeSet;
}



export class FlowBook extends YNotebook {
    
}


export class NodeSet extends CellList {

}


// NotebookActions.insertAbove(notebook

class Test{
sharedModel: YNotebook;

constructor(
this.sharedModel.insertCell()
}
}

YNotebook.prototype.changed

YNotebook.prototype.insertCell()

NotebookPanel.prototype.content

YCodeCell.prototype.changed

YMap.prototype.

CodeViewerWidget.IOptions


YCodeCell.prototype.toJSON
