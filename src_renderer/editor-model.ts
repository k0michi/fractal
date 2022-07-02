import autoBind from "auto-bind";
import AppModel from "./app-model";
import {Note} from './note';

export default class EditorModel {
  appModel: AppModel;
  note: Note;

  constructor(appModel: AppModel, note: Note) {
    this.appModel = appModel;
    this.note = note;
    autoBind(this);
  }
}