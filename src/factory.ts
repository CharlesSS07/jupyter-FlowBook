import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';

import { Contents } from '@jupyterlab/services';

import { FlowDocWidget, FlowPanel } from './widget';

import { FlowDoc, FlowDocModel } from './model';

/**
 * A widget factory to create new instances of FlowDocWidget.
 */
export class FlowEditorWidgetFactory extends ABCWidgetFactory<
  FlowDocWidget,
  FlowDocModel
> {
  /**
   * Constructor of FlowEditorWidgetFactory.
   *
   * @param options Constructor options
   */
  constructor(options: DocumentRegistry.IWidgetFactoryOptions) {
    super(options);
  }

  /**
   * Create a new widget given a context.
   *
   * @param context Contains the information of the file
   * @returns The widget
   */
  protected createNewWidget(
    context: DocumentRegistry.IContext<FlowDocModel>
  ): FlowDocWidget {
    return new FlowDocWidget({
      context,
      content: new FlowPanel(context)
    });
  }
}

/**
 * A Model factory to create new instances of FlowDocModel.
 */
export class FlowDocModelFactory
  implements DocumentRegistry.IModelFactory<FlowDocModel>
{
  /**
   * The name of the model.
   *
   * @returns The name
   */
  get name(): string {
    return 'flow-model';
  }

  /**
   * The content type of the file.
   *
   * @returns The content type
   */
  get contentType(): Contents.ContentType {
    return 'flowdoc' as any;
  }

  /**
   * The format of the file.
   *
   * @returns the file format
   */
  get fileFormat(): Contents.FileFormat {
    return 'text';
  }

  readonly collaborative: boolean = true;

  /**
   * Get whether the model factory has been disposed.
   *
   * @returns disposed status
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Dispose the model factory.
   */
  dispose(): void {
    this._disposed = true;
  }

  /**
   * Get the preferred language given the path on the file.
   *
   * @param path path of the file represented by this document model
   * @returns The preferred language
   */
  preferredLanguage(path: string): string {
    return '';
  }

  /**
   * Create a new instance of FlowDocModel.
   *
   * @param languagePreference Language
   * @param modelDB Model database
   * @param isInitialized - Whether the model is initialized or not.
   * @param collaborationEnabled - Whether collaboration is enabled at the application level or not (default `false`).
   * @returns The model
   */
  createNew(
    options: DocumentRegistry.IModelOptions<FlowDoc>
  ): FlowDocModel {
    return new FlowDocModel(options);
  }

  private _disposed = false;
}
