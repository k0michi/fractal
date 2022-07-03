import { v4 as uuidV4 } from 'uuid';
import {Head, Note} from './note';

export function parseXML(string: string) {
  const parser = new DOMParser();
  const $document = parser.parseFromString(string, 'text/xml');

  if (($document.firstChild as Element).tagName == 'parsererror') {
    throw new Error('Failed to parse');
  }

  return $document;
}

export function parseFML(string: string): Note {
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

export function createBlankHead(parent: string | undefined): Head {
  const createdAt = new Date();
  const modifiedAt = createdAt;
  const id = uuidV4();
  const title = '';

  const head = { id, title, createdAt, modifiedAt, parent };
  return head;
}

export function createBlankBody(): Element {
  const document = window.document.implementation.createDocument(null, 'fml');

  const body = document.createElement('body');
  return body;
}

export function createBlock(document: Document, tag: string) {
  const element = document.createElement(tag);
  element.setAttribute('id', uuidV4());
  return element;
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
  let fml = document.firstChild! as Element;

  while (fml.firstChild != null) {
    fml.removeChild(fml.firstChild);
  }

  const headEl = buildHead(document, head);
  fml.appendChild(headEl);
  fml.appendChild(body);

  fml.setAttribute('version', '0.1');

  return document;
}