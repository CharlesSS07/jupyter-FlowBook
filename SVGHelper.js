
class SVGHelper {

  static secretNameCount = 0;

  constructor(tag, parent) {
    this.secretName = SVGHelper.newSecretName();
    $('<'+tag+' id='+this.secretName+' />').appendTo(parent);
  }

  static newSecretName() {
    var name = 'svgElmntId'+SVGHelper.secretNameCount;
    if (document.getElementById(name)) {
      SVGHelper.secretNameCount+=1;
      return SVGHelper.newSecretName();
    }
    return name;
  }

  get() {
    return document.getElementById(this.secretName);
  }
}
