import { v4 as uuidV4 } from 'uuid';
import { Note } from './library';

export type Head = { [name: string]: any };

export function parseXML(string: string) {
  const parser = new DOMParser();
  const $document = parser.parseFromString(string, 'text/xml');

  if (($document.firstChild as Element).tagName == 'parsererror') {
    throw new Error('Failed to parse');
  }

  return $document;
}

export function parseMIML(string: string): Note {
  const document = parseXML(string);
  const head = extractHead(document);
  const body = document.querySelector('body')!;
  return { head, body };
}

export function extractHead(document: Document) {
  const head: Head = {};

  for (const property of document.querySelectorAll('head>*')) {
    head[property.tagName] = property.textContent!;
  }

  return head;
}

export function transformHL(root: Element) {
  const document = root.ownerDocument;

  for (const hl of root.querySelectorAll('hl > li > hl')) {
    const parentNext = hl.parentNode!.nextSibling;
    const gParent = hl.parentNode!.parentNode!;
    gParent.insertBefore(hl, parentNext);
  }

  for (const hl of root.querySelectorAll('hl')) {
    const ul = document.createElement('ul');
    ul.setAttribute('className', 'hierarchical');

    while (hl.firstChild != null) {
      ul.appendChild(hl.firstChild);
    }

    hl.parentNode!.replaceChild(ul, hl);
  }
}

export function createBlankHead(parent: string | undefined): Head {
  const createdAt = new Date();
  const modifiedAt = createdAt;
  const id = uuidV4();
  const title = '';

  const head = { id, title, createdAt, modifiedAt, parent };
  return head;
}

export function createBlankBody(): Element {
  const document = window.document.implementation.createDocument(null, 'miml');

  const body = document.createElement('body');
  return body;
}

export function buildHead(document: Document, headData: Head): Element {
  const head = document.createElement('head');

  for (const [key, data] of Object.entries(headData)) {
    if (data != null) {
      const property = document.createElement(key);

      if (data instanceof Date) {
        property.append(data.toISOString());
      } else {
        property.append(data.toString());
      }

      head.appendChild(property);
    }
  }

  return head;
}

export function buildDocument(head: Head, body: Element) {
  const document = body.ownerDocument;
  let miml = document.firstChild! as Element;

  while (miml.firstChild != null) {
    miml.removeChild(miml.firstChild);
  }

  const headEl = buildHead(document, head);
  miml.appendChild(headEl);
  miml.appendChild(body);

  miml.setAttribute('version', '0.1');

  return document;
}

export enum PropertyType {
  String, Number, Boolean, DateTime, URL, ID
}