import { createBlockquote, createCode, createHeader, createHorizontalRule, createListItem, createMath, createOrderedList, createParagraph, createUnorderedList } from "./main";
import Note from "./note";
import NoteBody from "./note-body";
import NoteHead from "./note-head";
import * as symbols from './symbols';

export function toSKML(note) {
  const serializer = new XMLSerializer();
  const skml = document.implementation.createDocument(null, 'skml');
  const $root = skml.firstChild;
  const $head = skml.createElement('head');
  $root.append($head);

  for (const [key, value] of Object.entries(note.head.properties)) {
    const meta = skml.createElement(key);
    meta.append(value);
    $head.append(meta);
  }

  const $body = skml.createElement('body');
  $root.append($body);

  for (const e of note.body.children) {
    $body.appendChild(toDOM(skml, e));
  }

  return serializer.serializeToString(skml);
}

function toDOM(xml, e) {
  const tagName = e.type;
  const element = xml.createElement(tagName);

  if (e.language != null) {
    element.setAttribute('language', e.language);
  }

  if (tagName == 'ul' || tagName == 'ol') {
    for (const i of e.content) {
      const item = xml.createElement('li');
      item.textContent = i.content;
      element.append(item);
    }
  } else {
    element.append(e.content);
  }

  return element;
}

export function fromSKML(text) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');
  const $root = xml.firstChild;
  const $head = $root.querySelector('head');
  const properties = {};

  for (const n of $head.childNodes) {
    const tagName = n.tagName;
    let content = n.textContent;

    if (tagName == 'created' || tagName == 'modified') {
      content = parseInt(content);
    }

    properties[tagName] = content;
  }

  const head = new NoteHead(properties);
  const $body = $root.querySelector('body');
  const body = [];

  for (const n of $body.childNodes) {
    const tagName = n.tagName;
    const content = n.textContent;

    if (tagName == 'p') {
      body.push(createParagraph(content));
    } else if (tagName == 'math') {
      body.push(createMath(content));
    } else if (symbols.headers.includes(tagName)) {
      body.push(createHeader(parseInt(tagName[1]), content));
    } else if (tagName == 'hr') {
      body.push(createHorizontalRule());
    } else if (tagName == 'blockquote') {
      body.push(createBlockquote(content));
    } else if (tagName == 'code') {
      const language = n.getAttribute('language');
      body.push(createCode(content, language));
    } else if (tagName == 'ol') {
      const items = [];

      for (const childN of n.childNodes) {
        items.push(createListItem(childN.textContent));
      }

      body.push(createOrderedList(items));
    } else if (tagName == 'ul') {
      const items = [];

      for (const childN of n.childNodes) {
        items.push(createListItem(childN.textContent));
      }

      body.push(createUnorderedList(items));
    }
  }

  return new Note(head, new NoteBody(body));
}