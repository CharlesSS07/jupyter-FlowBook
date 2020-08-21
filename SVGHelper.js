
class SVGHelper {

  static secretNameCount = 0;

  constructor(tag, parent) {
    this.secretName = SVGHelper.newSecretName();
    $('<'+tag+' id='+this.secretName+' />').appendTo(parent);
  }

  /**
  * private function that gets an id for this svg element to be called by
  * */
  static newSecretName() {
    var name = 'svgElmntId'+SVGHelper.secretNameCount;
    if (document.getElementById(name)) {
      SVGHelper.secretNameCount+=1;
      return SVGHelper.newSecretName();
    }
    return name;
  }

  /**
  * finds the svg element and returns something that can be edited
  * @return {HTMLElement} the svg element that you are looking for.
  * */
  get() {
    return document.getElementById(this.secretName);
  }
}
