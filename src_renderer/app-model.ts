import autoBind from "auto-bind";
import React from "react";
import { Observable } from "kyoka";
import { parseMIML, parseXML, transformHL } from "./miml";
import { toElement } from "./miml-react";
import Library, { Note } from "./library";
import ElementType from "./element-type";
import { v4 as uuidV4 } from 'uuid';

export default class AppModel {
  library = new Library(this);
  note = new Observable<Note | null>(null);
  element = new Observable<React.ReactElement | null>(null);

  constructor() {
    autoBind(this);
    this.library.initialize();
  }

  async openNoteFromPath(path: string) {
    const content = await bridge.readFileUTF8(path);
    const note = parseMIML(content);
    this.openNote(note);
  }

  async openNote(note: Note) {
    this.note.set(note);
    this.updateNote();
  }

  updateNote() {
    this.note.set(this.note.get());
  }

  async onClickOpen() {
    const file = await bridge.showFileOpenDialog();

    if (file != null) {
      await this.openNoteFromPath(file);
    }
  }

  onChangeTitle(newTitle: string) {
    const note = this.note.get();
    note!.head.title = newTitle;
    this.note.set(note);
  }

  onClickSave() {
    const note = this.note.get();
    this.library.saveNote(note!);
    this.library.changeTitle(note?.head.id, note?.head.title);
  }

  onClickAdd(type: ElementType) {
    const note = this.note.get();

    if (note == null) {
      return;
    }

    const body = note?.body;
    const document = note?.body.ownerDocument;

    if (type == ElementType.Paragraph) {
      const p = document.createElement('p');
      p.setAttribute('id', uuidV4());
      body.appendChild(p);
    }

    this.updateNote();
  }

  onChange(id:string, content:string) {
    const note = this.note.get();
    const element = note?.body.querySelector(`[id="${id}"]`)!;
    element.innerHTML = content;
    this.updateNote();
  }
}