import autoBind from "auto-bind";
import AppModel from "./app-model";

export default class EditorModel {
  appModel: AppModel;

  constructor(appModel: AppModel) {
    this.appModel = appModel;
    autoBind(this);
  }
}