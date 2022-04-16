import Katex from 'katex';
import Prism from 'prismjs';

import * as utils from './utils';

import './styles.css';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';

const PARAGRAPH = 'p';
const BOLD = 'b';
const ITALIC = 'i';
const UNDERLINE = 'u';
const STRIKETHROUGH = 's';
const HEADER1 = 'h1';
const HEADER2 = 'h2';
const HEADER3 = 'h3';
const HEADER4 = 'h4';
const HEADER5 = 'h5';
const HEADER6 = 'h6';
const HORIZONTAL_RULE = 'hr';
const BLOCKQUOTE = 'blockquote';
const MATH = 'math';

const headers = [HEADER1, HEADER2, HEADER3, HEADER4, HEADER5, HEADER6];

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
      } else if (headers.includes(tagName)) {
        nodes.push(createHeader(parseInt(tagName[1]), content, created, modified));
      } else if (tagName == 'hr') {
        nodes.push(createHorizontalRule(created, modified));
      } else if (tagName == 'blockquote') {
        nodes.push(createBlockquote(content, created, modified));
      }
    }

    return new Note(nodes);
  }
}

let currentNote = new Note();

let noteContent;
let caretPos;

/*
function applyBold(node, start, end) {
  const range = document.createRange();
  range.setStart(node,start);
  range.setEnd(node,end);
  range.surroundContents(document.createElement('b'));
}
*/

window.addEventListener('load', () => {
  noteContent = document.getElementById('note-content');

  document.getElementById('ins-math').addEventListener('click', e => {
    const math = createMath();
    currentNote.append(caretPos + 1, math);
  });

  for (let i = 1; i <= 6; i++) {
    document.getElementById('ins-h' + i).addEventListener('click', e => {
      const header = createHeader(i);
      currentNote.append(caretPos + 1, header);
    });
  }

  document.getElementById('ins-hr').addEventListener('click', e => {
    const horizontal = createHorizontalRule();
    currentNote.append(caretPos + 1, horizontal);
  });

  document.getElementById('ins-blockquote').addEventListener('click', e => {
    const blockquote = createBlockquote();
    currentNote.append(caretPos + 1, blockquote);
  });

  /*
  document.getElementById('bold').addEventListener('click', e => {
    const selection = window.getSelection();

    if(selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      let node = range.startContainer;

      applyBold(node, range.startOffset, node==range.endContainer?range.endOffset:node.length);

      if (node != range.endContainer){
        do {
          node = node.nextSibling;

          const b = node.parentElement.closest('b');
          const p = node.parentElement.closest('p');
        
          if (b == null) {
            applyBold(node, 0, node==range.endContainer?range.endOffset:node.length);
          }
        }while(node != range.endContainer);
      }
    }
  });*/

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
      textArea.normalize();
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

  edit.addEventListener('focus', e => {
    const index = currentNote.content.indexOf(math);
    caretPos = index;
  });

  return math;
}

function createHeader(level, content = '', created, modified) {
  const type = headers[level - 1];
  const dom = document.createElement(type);
  dom.textContent = content;
  dom.style = 'overflow-wrap: anywhere; width: 100%;';
  dom.contentEditable = true;

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const header = {
    type,
    content,
    element: dom,
    created,
    modified
  };

  dom.addEventListener('input', e => {
    header.content = dom.textContent;
    header.modified = Date.now();
  });

  dom.addEventListener('focus', e => {
    const index = currentNote.content.indexOf(header);
    caretPos = index;
  });

  return header;
}

function createHorizontalRule(created, modified) {
  const dom = document.createElement('hr');

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const horizontal = {
    type: HORIZONTAL_RULE,
    element: dom,
    created,
    modified
  };

  return horizontal;
}

function createBlockquote(content = '', created, modified) {
  const dom = document.createElement('blockquote');
  dom.textContent = content;
  dom.style = 'overflow-wrap: anywhere; width: 100%;';
  dom.contentEditable = true;

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const blockquote = {
    type: BLOCKQUOTE,
    content,
    element: dom,
    created,
    modified
  };

  dom.addEventListener('input', e => {
    blockquote.content = dom.textContent;
    blockquote.modified = Date.now();
  });

  dom.addEventListener('focus', e => {
    const index = currentNote.content.indexOf(blockquote);
    caretPos = index;
  });

  return blockquote;
}

/*
function createBold(content = '', created, modified) {
  const element = document.createElement('b');
  element.textContent = content;

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const bold = {
    type: BOLD,
    content,
    element,
    created,
    modified
  };

  return bold;
}
*/