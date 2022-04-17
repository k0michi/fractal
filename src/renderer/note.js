import { createBlockquote, createCode, createHeader, createHorizontalRule, createMath, createParagraph, headers } from "./main";
import NoteView from "./note-view";

export default class Note {
  constructor(created, modified, content) {
    this.noteView = new NoteView();
    this.created = created ?? Date.now();
    this.modified = modified ?? this.created;
    this.content = content ?? [createParagraph()];
  }

  append(index, element) {
    if (index >= this.content.length) {
      this.noteView.insertElement(element.element, null);
    } else {
      this.noteView.insertElement(element.element, this.content[index].element);
    }

    this.content.splice(index, 0, element);
  }

  toXML() {
    const serializer = new XMLSerializer();
    const xml = document.implementation.createDocument(null, 'xml');

    for (const e of this.content) {
      const tagName = e.type;
      const element = xml.createElement(tagName);
      element.append(e.content);
      element.setAttribute('created', e.created);
      element.setAttribute('modified', e.modified);

      if (e.language != null) {
      element.setAttribute('language', e.language);
      }

      xml.firstChild.appendChild(element);
    }

    return serializer.serializeToString(xml);
  }

  static fromXML(text) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const nodes = [];

    for (const n of xml.firstChild.childNodes) {
      const tagName = n.tagName;
      const content = n.textContent;
      const created = parseInt(n.getAttribute('created'));
      const modified = parseInt(n.getAttribute('modified'));

      if (tagName == 'p') {
        nodes.push(createParagraph(content, created, modified));
      } else if (tagName == 'math') {
        nodes.push(createMath(content, created, modified));
      } else if (headers.includes(tagName)) {
        nodes.push(createHeader(parseInt(tagName[1]), content, created, modified));
      } else if (tagName == 'hr') {
        nodes.push(createHorizontalRule(created, modified));
      } else if (tagName == 'blockquote') {
        nodes.push(createBlockquote(content, created, modified));
      } else if (tagName == 'code') {
        const language = n.getAttribute('language');
        nodes.push(createCode(content, language, created, modified));
      }
    }

    // FIX ME
    return new Note(null, null, nodes);
  }
}