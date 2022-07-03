import autoBind from "auto-bind";
import AppModel from "./app-model";
import { CursorRange, getCursorRange, normalizeRange, setCursorRange, visitNodes } from "./cursor";
import ElementType from "./element-type";
import { buildDocument, createBlock } from "./fml";
import { Note } from './note';
import EditorView from "./views/editor-view";

export default class EditorModel {
  appModel: AppModel;
  note: Note;
  view: EditorView | null;

  constructor(appModel: AppModel, note: Note) {
    this.appModel = appModel;
    this.note = note;
    autoBind(this);
    this.appendParagraphLast();
  }

  registerView(view: EditorView) {
    this.view = view;
  }

  onChangeTitle(newTitle: string) {
    this.note.head.title = newTitle;
    // notify update to library
  }

  addElement(type: ElementType) {
    const body = this.note?.body;
    const document = this.note?.body.ownerDocument;

    /*
    if (body.lastChild?.textContent?.length == 0) {
      body.removeChild(body.lastChild);
    }*/

    const newBlock = createBlock(document, type);
    body.appendChild(newBlock);
    this.view?.appendChild(newBlock);
    this.appendParagraphLast();
  }

  onEditElement(id: string, e: Element) {
    const element = this.getBlock(id);

    if (element.tagName == 'math') {
      element.textContent = e.textContent;
    } else if (element.tagName == 'code') {
      const code = e.querySelector('code');
      element.textContent = code?.textContent ?? '';
      const select = e.querySelector('select');
      element.setAttribute('lang', select?.value ?? '');
    } else {
      element.innerHTML = e.innerHTML;
    }

    // notify update
  }

  changeTextStyle(type: ElementType) {
    const selection = window.getSelection()!;
    const anchor = getParentBlock(selection.anchorNode);
    const focus = getParentBlock(selection.focusNode);

    if (anchor == null || focus == null || anchor != focus) {
      return;
    }

    const block = getParentBlock(selection.focusNode!)!;
    let range = getCursorRange(block);
    range = normalizeRange(range);
    const xmlBlock = this.getBlock(block.dataset.id!);

    console.log('isEveryCharacterStyled', isEveryCharacterStyled(xmlBlock, range, type))
    if (isEveryCharacterStyled(xmlBlock, range, type)) {
      // removeStyleRange(xmlBlock, range, type);
      // removeStyleRange(block, range, type);
    } else {
      applyStyleRange(xmlBlock, range, type);
      applyStyleRange(block, range, type);
    }
    setCursorRange(block, range);
  }

  getBlock(id: string) {
    return this.note.body.querySelector(`[id="${id}"]`)!;
  }

  appendParagraphLast() {
    const note = this.note;
    const lastElement = note.body.lastElementChild;
    let willAppend = lastElement == null;

    if (lastElement != null) {
      if (lastElement.tagName != 'p') {
        willAppend = true;
      }
    }

    if (willAppend) {
      const document = note.body.ownerDocument!;
      const p = createBlock(document, 'p');
      note.body.append(p);
      this.view?.appendChild(p);
    }
  }
}

function isEveryCharacterStyled(block: Element, range: CursorRange, type: string) {
  let chars = 0;
  let result = true;

  visitNodes(block, n => {
    if (n.nodeType == Node.TEXT_NODE) {
      const t = n as Text;
      const textStart = chars;
      const textEnd = chars + t.length;

      // FIXME: Ranges might be wrong
      if (textStart <= range.start && textEnd > range.start) {
        if (!isChildOf(t, type)) {
          result = false;
        }
      } else if (textStart < range.end && textEnd >= range.end) {
        if (!isChildOf(t, type)) {
          result = false;
        }
      } else if (textStart >= range.start && textEnd <= range.end) {
        if (!isChildOf(t, type)) {
          result = false;
        }
      }

      chars = textEnd;
    }
  });

  return result;
}

function findParentTag(node: Node, tag: string) {
  let m: Node | null | undefined = node;

  while (m != null && !isTag(m, tag)) {
    m = m.parentNode;
  }

  return m;
}

function isChildOf(node: Node, tag: string) {
  return findParentTag(node, tag) != null;
}

function isTag(node: Node | null, tag: string) {
  return node != null && node.nodeType == Node.ELEMENT_NODE && (node as Element).tagName.toLowerCase() == tag;
}

function applyStyleRange(block: Element, range: CursorRange, type: string) {
  let chars = 0;

  visitNodes(block, n => {
    if (n.nodeType == Node.TEXT_NODE) {
      const t = n as Text;
      const textStart = chars;
      const textEnd = chars + t.length;

      if (textStart <= range.start && textEnd > range.start) {
        applyStyle(t, range.start - chars, Math.min(range.end, textEnd) - chars, type);
      } else if (textStart < range.end && textEnd >= range.end) {
        applyStyle(t, Math.max(range.start, textStart) - chars, range.end - chars, type);
      } else if (textStart >= range.start && textEnd <= range.end) {
        applyStyle(t, textStart - chars, textEnd - chars, type);
      }

      chars = textEnd;
    }
  });
}

function applyStyle(text: Text, start: number, end: number, type: string) {
  if (isChildOf(text, type)) {
    return;
  }

  if (start == end) {
    return;
  }

  const document = text.ownerDocument;

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
  parent?.insertBefore(document.createTextNode(rest2), next);
  parent?.normalize();
}

/*
function removeStyleRange(block: Element, range: CursorRange, type: ElementType) {
  let chars = 0;

  visitNodes(block, n => {
    if (n.nodeType == Node.TEXT_NODE) {
      const t = n as Text;
      const textStart = chars;
      const textEnd = chars + t.length;

      if (textStart <= range.start && textEnd > range.start) {
        removeStyle(t, range.start - chars, Math.min(range.end, textEnd) - chars, type);
      } else if (textStart < range.end && textEnd >= range.end) {
        removeStyle(t, Math.max(range.start, textStart) - chars, range.end - chars, type);
      } else if (textStart >= range.start && textEnd <= range.end) {
        removeStyle(t, textStart - chars, textEnd - chars, type);
      }

      chars = textEnd;
    }
  });
}

function removeStyle(text: Text, start: number, end: number, type: ElementType) {
  const parentTag = findParentTag(text, type);

  if (parentTag == null) {
    return;
  }

  if (start == end) {
    return;
  }

  const document = text.ownerDocument;
  reorderTag(parentTag as Element);
}

function reorderTag(node: Element) {
  const tagName = node.tagName;
  const document = node.ownerDocument!;
  const children = document.createDocumentFragment();

  for (const c of node.childNodes) {
    children.appendChild(c);
  }

  visitNodes(children, n => {
    if (n.nodeType == Node.TEXT_NODE) {
      const t = n as Text;
      applyStyle(t, 0, t.length, tagName);
    }
  });

  node.parentNode?.replaceChild(children, node);
}*/

function getParentBlock(node: Node | null): HTMLElement | null {
  let m: Node | null = node;

  while (m != null && !(m.nodeType == Node.ELEMENT_NODE && (m as HTMLElement).dataset.id)) {
    m = m.parentNode;
  }

  return m as HTMLElement;
}