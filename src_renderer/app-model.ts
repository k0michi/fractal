import autoBind from "auto-bind";
import React from "react";
import { Observable } from "kyoka";
import { createBlock, parseMIML, parseXML, transformHL } from "./miml";
import Library, { Note } from "./library";
import ElementType from "./element-type";
import { v4 as uuidV4 } from 'uuid';
import { getElementTag } from "./element-tag";

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
    appendParagraphLast(note);
    this.note.set(note);
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

    if (body.lastChild?.textContent?.length == 0) {
      body.removeChild(body.lastChild);
    }

    body.appendChild(createBlock(document,getElementTag(type)));
    appendParagraphLast(note);
    this.updateNote();
  }

  onChange(id:string, content:string) {
    const note = this.note.get();
    const element = note?.body.querySelector(`[id="${id}"]`)!;
    element.innerHTML = content;
    this.updateNote();
  }
}

function  appendParagraphLast(note: Note) {
  const lastElement = note?.body.lastElementChild;
  let willAppend = lastElement == null;

  if (lastElement!=null) {
    if (lastElement.tagName != 'p') {
      willAppend = true;
    }
  }

  if (willAppend) {
    const document = note?.body.ownerDocument!;
    note?.body.append(createBlock(document, 'p'));
  }
}