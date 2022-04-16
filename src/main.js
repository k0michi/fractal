import Katex from 'katex';
import Prism from 'prismjs';

import * as utils from './utils';

import './styles.css';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';

const PARAGRAPH = 'p';
const MATH = 'math';

class Note {
  constructor(...args) {
    if (args.length == 0) {
      this.content = [createParagraph()];
    } else {
      this.content = args[0];
    }
  }

  append(index, element) {
    if (index >= this.content.length) {
      noteContent.insertBefore(element.element, null);
    } else {
      noteContent.insertBefore(element.element, this.content[index].element);
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
      }
    }

    return new Note(nodes);
  }
}

let currentNote = new Note();

let noteContent;
let caretPos;

window.addEventListener('load', () => {
  noteContent = document.getElementById('note-content');

  document.getElementById('ins-math').addEventListener('click', e => {
    const math = createMath();
    currentNote.append(caretPos + 1, math);
  });

  document.getElementById('save').addEventListener('click', async e => {
    utils.saveFile('Untitled.xml', currentNote.toXML());
  });

  document.getElementById('open').addEventListener('click', async e => {
    const files = await utils.openFile();
    const file = files[0];
    const xml = await utils.readAsText(file);
    currentNote = Note.fromXML(xml);

    utils.removeChildNodes(noteContent);

    for (const e of currentNote.content) {
      noteContent.append(e.element);
    }
  });

  for (const e of currentNote.content) {
    noteContent.append(e.element);
  }
});

function focus(index) {
  currentNote.content[index].element.focus();
}

let isComposing = false;

window.addEventListener('compositionstart', e => {
  isComposing = true;
});

window.addEventListener('compositionend', e => {
  isComposing = false;
});

function createParagraph(content = '', created, modified) {
  const textArea = document.createElement('p');
  textArea.style = 'overflow-wrap: anywhere; width: 100%;';
  textArea.contentEditable = true;
  textArea.textContent = content;

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const paragraph = {
    type: PARAGRAPH,
    content,
    element: textArea,
    created,
    modified
  };

  textArea.addEventListener('keydown', e => {
    const index = currentNote.content.indexOf(paragraph);
    caretPos = index;

    if (e.key == 'Enter' && !isComposing) {
      const nextParagraph = createParagraph();
      currentNote.append(index + 1, nextParagraph);
      nextParagraph.element.focus();
      e.preventDefault();
    }

    const selection = window.getSelection();

    if (e.key == 'ArrowUp' && selection.isCollapsed && selection.anchorOffset == 0) {
      if (index - 1 >= 0) {
        focus(index - 1);
      }
    }
    console.log(selection.anchorOffset);
    console.log(paragraph.content.length);

    if (e.key == 'ArrowDown') {
      // FIX ME
      if (index + 1 < currentNote.content.length && selection.isCollapsed && selection.anchorOffset == paragraph.content.length) {
        focus(index + 1);
      }
    }
  });

  textArea.addEventListener('input', e => {
    paragraph.content = textArea.textContent;
    paragraph.modified = Date.now();
  });

  textArea.addEventListener('focus', e => {
    const index = currentNote.content.indexOf(paragraph);
    caretPos = index;
  });

  textArea.addEventListener('paste', e => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      selection.collapseToEnd();
      paragraph.content = textArea.textContent;
    }

    e.preventDefault();
  });

  return paragraph;
}

function createMath(content = '', created, modified) {
  const dom = document.createElement('div');
  dom.className = 'math';
  const edit = document.createElement('pre');
  edit.style = 'overflow-wrap: anywhere; width: 100%;';
  edit.contentEditable = true;

  edit.textContent = content;
  Katex.render(content, dom, { displayMode: true });

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const math = {
    type: MATH,
    content,
    element: dom,
    created,
    modified
  };

  window.addEventListener('click', e => {
    if (dom.contains(e.target) && (dom.firstChild == null || dom.firstChild != edit)) {
      if (dom.firstChild != null) {
        dom.removeChild(dom.firstChild);
      }

      dom.append(edit);
      edit.focus();
    } else if (!dom.contains(e.target) && (dom.firstChild == null || !dom.firstChild.classList.contains('katex-display'))) {
      if (dom.firstChild != null) {
        dom.removeChild(dom.firstChild);
      }

      Katex.render(math.content, dom, { displayMode: true });
    }
  });

  edit.addEventListener('input', e => {
    math.content = edit.textContent;
    math.modified = Date.now();
  });

  return math;
}