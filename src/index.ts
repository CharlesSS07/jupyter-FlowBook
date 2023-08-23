import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import { ICollaborativeDrive } from '@jupyter/docprovider';

// import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ICommandPalette, WidgetTracker, IWidgetTracker } from '@jupyterlab/apputils';
//import * as React from 'react';

// import { Widget } from '@lumino/widgets';
//import { ReactWidget } from '@jupyterlab/ui-components';

import { Token } from '@lumino/coreutils';

import { FlowEditorWidgetFactory, FlowDocModelFactory } from './factory';
import { FlowDoc } from './model';
import { FlowDocWidget } from './widget';

/**
 * The name of the factory that creates editor widgets.
 */
const FACTORY = 'Flow editor';

// Export a token so other extensions can require it
export const IFlowDocTracker = new Token<IWidgetTracker<FlowDocWidget>>(
  'flowDocTracker'
);

/**
 * Initialization data for the flowlab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'flowlab:plugin',
  description: 'A more intuitive, visual-based way of understanding and editing code. Code is split into nodes implementing functions with wires transporting data between them.',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  optional: [ISettingRegistry, ICollaborativeDrive],
  provides: IFlowDocTracker,
  activate: (app: JupyterFrontEnd, palette: ICommandPalette, restorer: ILayoutRestorer, settingRegistry: ISettingRegistry | null, drive: ICollaborativeDrive | null) => {
    console.log('JupyterLab extension flowlab is activated!');
    //require('./style.css');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('flowlab settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for flowlab.', reason);
        });
    }


    // Namespace for the tracker
    const namespace = 'documents-flowlab';
    // Creating the tracker for the document
    const tracker = new WidgetTracker<FlowDocWidget>({ namespace });

    // Handle state restoration.
    if (restorer) {
      // When restoring the app, if the document was open, reopen it
      restorer.restore(tracker, {
        command: 'docmanager:open',
        args: widget => ({ path: widget.context.path, factory: FACTORY }),
        name: widget => widget.context.path
      });
    }

    // register the filetype
    app.docRegistry.addFileType({
      name: 'flow',
      displayName: 'Node Flow',
      mimeTypes: ['text/json', 'application/json'],
      extensions: ['.flow'],
      fileFormat: 'text',
      contentType: 'flowdoc' as any
    });

    // Creating and registering the shared model factory
    // As the third-party jupyter-collaboration package is not part of JupyterLab core,
    // we should support collaboration feature absence.
    if (drive) {
      const sharedFlowFactory = () => {
        return FlowDoc.create();
      };
      drive.sharedModelFactory.registerDocumentFactory(
        'flowdoc',
        sharedFlowFactory
      );
    }

    // Creating and registering the model factory for our custom DocumentModel
    const modelFactory = new FlowDocModelFactory();
    app.docRegistry.addModelFactory(modelFactory);

    // Creating the widget factory to register it so the document manager knows about
    // our new DocumentWidget
    const widgetFactory = new FlowEditorWidgetFactory({
      name: FACTORY,
      modelName: 'flow-model',
      fileTypes: ['flow'],
      defaultFor: ['flow']
    });

    // Add the widget to the tracker when it's created
    widgetFactory.widgetCreated.connect((sender, widget) => {
      // Notify the instance tracker if restore data needs to update.
      widget.context.pathChanged.connect(() => {
        tracker.save(widget);
      });
      tracker.add(widget);
    });

    // Registering the widget factory
    app.docRegistry.addWidgetFactory(widgetFactory);


    // Add an application command
    const command: string = 'flowlab:new';
    app.commands.addCommand(command, {
      label: 'Open New Flow Node Editor',
      execute: () => {
        console.log('implement create flow command')
        // // Regenerate the widget if disposed
        // if (widget.isDisposed) {
        //   widget = newWidget();
        // }
        // if (!widget.isAttached) {
        //   // Attach the widget to the main work area if it's not there
        //   app.shell.add(widget, 'main');
        // }
        // // Activate the widget
        // app.shell.activateById(widget.id);
      }
    });

    // Add the command to the palette.
    palette.addItem({ command, category: 'Tutorial' });
  }
};

export default plugin;
