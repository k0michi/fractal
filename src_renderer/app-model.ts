import autoBind from "auto-bind";
import React from "react";
import { Observable } from "kyoka";
import { createBlock, parseMIML, parseXML, transformHL } from "./miml";
import Library, { Note } from "./library";
import ElementType from "./element-type";
import { v4 as uuidV4 } from 'uuid';
import { getCursorRange, normalizeRange, setCursorRange, visitNodes } from "./cursor";

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

    body.appendChild(createBlock(document, type));
    appendParagraphLast(note);
    this.updateNote();
  }

  onChange(id: string, content: string) {
    const element = this.getBlock(id);
    element.innerHTML = content;
    this.updateNote();
  }

  onClickTextStyle(type: ElementType) {
    const selection = window.getSelection()!;

    if (getParentBlock(selection.anchorNode!) != getParentBlock(selection.focusNode!)) {
      return;
    }

    const block = getParentBlock(selection.focusNode!)!;
    let range = getCursorRange(block);
    range = normalizeRange(range);
    const xmlBlock = this.getBlock(block.dataset.id!);
    let chars = 0;

    visitNodes(xmlBlock, n => {
      if (n.nodeType == Node.TEXT_NODE) {
        const t = n as Text;
        const textStart = chars;
        const textEnd = chars + t.length;

        if (textStart <= range.start && textEnd >= range.start) {
          applyStyle(t, range.start - chars, Math.min(range.end, textEnd) - chars, type);
        } else if (textStart <= range.end && textEnd >= range.end) {
          applyStyle(t, Math.max(range.start, textStart) - chars, range.end - chars, type);
        }
        chars = textEnd;
      }
    });

    this.updateNote();
    //setCursorRange(block, range);
    //selection.collapseToEnd();
  }

  getBlock(id: string) {
    return  this.note.get()!.body.querySelector(`[id="${id}"]`)!;
  }
}

function applyStyle(text: Text, start: number, end: number, type: ElementType) {
  const document = text.ownerDocument;

  if (start == end) {
    return;
  }

  const parent = text.parentNode;
  const next = text.nextSibling;
  parent?.removeChild(text);
  const inline = document.createElement(type);
  inline.append(text.data.substring(start, end));
  parent?.appendChild(inline);
  const rest1 = text.data.substring(0, start);
  const rest2 = text.data.substring(end);
  parent?.insertBefore(document.createTextNode(rest1), next);
  parent?.insertBefore(inline, next);
  console.log(inline)
  parent?.insertBefore(document.createTextNode(rest2), next);
}

function getParentBlock(node: Node): HTMLElement|null {
  let m: Node | null = node;

  while (m != null && !(m.nodeType == Node.ELEMENT_NODE && (m as HTMLElement).dataset.id)) {
    m = m.parentNode;
  }

  return m as HTMLElement;
}

function appendParagraphLast(note: Note) {
  const lastElement = note?.body.lastElementChild;
  let willAppend = lastElement == null;

  if (lastElement != null) {
    if (lastElement.tagName != 'p') {
      willAppend = true;
    }
  }

  if (willAppend) {
    const document = note?.body.ownerDocument!;
    note?.body.append(createBlock(document, 'p'));
  }
}