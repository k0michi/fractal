import autoBind from "auto-bind";
import React from "react";
import { Observable } from "kyoka";
import { buildDocument, createBlock, parseFML, parseXML } from "./fml";
import LibraryModel from "./library-model";
import { Note } from './note';
import ElementType from "./element-type";
import EditorModel from "./editor-model";

export default class AppModel {
  library = new LibraryModel(this);
  editors: EditorModel[] = [];
  activeEditor = new Observable<EditorModel | null>(null);
  element = new Observable<React.ReactElement | null>(null);

  constructor() {
    autoBind(this);
    this.library.initialize();
  }

  async openNoteFromPath(path: string) {
    const content = await bridge.readFileUTF8(path);
    const note = parseFML(content);
    note.path = path;

    console.log('openNoteFromPath', note.head.title, path);

    this.openNote(note);
  }

  async openNote(note: Note) {
    const editor = new EditorModel(this, note);
    this.editors.push(editor);
    this.activeEditor.set(editor);
  }

  async onClickOpen() {
    const file = await bridge.showFileOpenDialog();

    if (file != null) {
      await this.openNoteFromPath(file);
    }
  }

  onClickSave() {
    const activeNote = this.activeEditor.get()?.note;

    if (activeNote != null) {
      this.saveNote(activeNote);
    }
  }

  onClickAdd(type: ElementType) {
    this.activeEditor.get()?.addElement(type);
  }

  onClickTextStyle(type: ElementType) {
    this.activeEditor.get()?.changeTextStyle(type);
  }

  async saveNote(note: Note) {
    const path = note.path;
    const serializer = new XMLSerializer();
    const bodyCloned = note.body.cloneNode(true) as Element;

    if (bodyCloned.lastElementChild?.tagName == 'p' && bodyCloned.lastElementChild?.textContent?.length == 0) {
      bodyCloned.removeChild(bodyCloned.lastElementChild);
    }

    const document = buildDocument(note.head, bodyCloned);
    const serialized = serializer.serializeToString(document);
    await bridge.writeFile(path, serialized);
  }
}