import Katex from 'katex';
import Prism from 'prismjs';

import * as utils from './utils';
import Note from './note';
import NoteFile from './note-file';
import Library from './library';

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
const IMAGE = 'image';
const CODE = 'code';
const MATH = 'math';

const headers = [HEADER1, HEADER2, HEADER3, HEADER4, HEADER5, HEADER6];

async function saveNoteFile(noteFile) {
  if (noteFile.path == null) {
    const path = await bridge.saveFileDialog();

    if (path == null) {
      throw new Error('Canceled');
    }

    noteFile.path = path;
  }

  await bridge.saveFile(noteFile.path, noteFile.note.toXML());
}

function renderNote(note) {
  utils.removeChildNodes($noteContainer);
  $noteContainer.append(note.noteView.$note);
  note.noteView.render(note);
}

let $noteContainer;
let currentNote = new Note();
let currentNoteFile = new NoteFile(null, currentNote);
let caretPos = 0;

/*
function applyBold(node, start, end) {
  const range = document.createRange();
  range.setStart(node,start);
  range.setEnd(node,end);
  range.surroundContents(document.createElement('b'));
}
*/

window.addEventListener('load', async () => {
  $noteContainer = document.getElementById('note-container');

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
  document.getElementById('ins-image').addEventListener('click', async e => {
    const files = await utils.openFile();
    const file = files[0];
    const imageData = await utils.readAsDataURL(file);
    const image = createImage(imageData);
    currentNote.append(caretPos + 1, image);
  });

  document.getElementById('ins-code').addEventListener('click', e => {
    const code = createCode();
    currentNote.append(caretPos + 1, code);
  });
  */

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
    await saveNoteFile(currentNoteFile);
  });

  document.getElementById('open').addEventListener('click', async e => {
    const file = await bridge.openFile();
    const xml = await bridge.readFile(file);
    currentNote = Note.fromXML(xml);
    currentNoteFile = new NoteFile(file, currentNote);
    renderNote(currentNote);
  });

  renderNote(currentNote);

  const userDataPath = await bridge.getPath('userData');
  const libraryPath = `${userDataPath}/library`;
  const library = new Library(libraryPath);
  await library.initialize();

  const libraryDOM = document.getElementById('library');
  renderFiles();

  function renderFiles() {
    utils.removeChildNodes(libraryDOM);

    for (const f of library.files) {
      const fileDOM = document.createElement('div');
      fileDOM.classList.add('file');
      fileDOM.textContent = f;
      libraryDOM.append(fileDOM);
    }
  }

  document.getElementById('new').addEventListener('click', async e => {
    let name = `untitled_${dateToString(new Date())}`;

    if (await library.doesExist(name)) {
      let i = 2;

      while (await library.doesExist(`${name}_${i}`)) {
        i++;
      }

      name = `${name}_${i}`;
    }

    currentNote = new Note();
    currentNoteFile = new NoteFile(`${library.basePath}/${name}`, currentNote);
    await saveNoteFile(currentNoteFile);
    await library.refresh();
    renderFiles();
  });

  libraryDOM.addEventListener('click', async e => {
    if (e.target.classList.contains('file')) {
      const filename = e.target.textContent;
      const noteFile = await library.open(filename);
      currentNoteFile = noteFile;
      currentNote = noteFile.note;
      renderNote(currentNote);
    }
  });
});

function dateToString(date) {
  return `${padZero(date.getFullYear(), 4)}-${padZero(date.getMonth() + 1, 2)}-${padZero(date.getDate(), 2)}`;
}

function padZero(value, n) {
  return value.toString().padStart(n, '0');
}

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

export function createParagraph(content = '', created, modified) {
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

export function createMath(content = '', created, modified) {
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

export function createHeader(level, content = '', created, modified) {
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

export function createHorizontalRule(created, modified) {
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

export function createBlockquote(content = '', created, modified) {
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
function createImage(content, created, modified) {
  const dom = document.createElement('img');
  dom.textContent = content;
  dom.src = content;
  //dom.style = 'overflow-wrap: anywhere; width: 100%;';

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const image = {
    type: IMAGE,
    content,
    element: dom,
    created,
    modified
  };

  return image;
}

function createCode(content = '',language='javascript', created, modified) {
  const domPre = document.createElement('pre');
  const domCode = document.createElement('code');
  domPre.append(domCode);
  domCode.textContent = content;
  domCode.contentEditable = true;

  if (language != null) {
    domCode.classList.add(`language-${language}`);
    domPre.classList.add(`language-${language}`);
  }

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const code = {
    type: CODE,
    content,
    element: domPre,
    created,
    modified
  };

  domCode.addEventListener('input', e => {
    code.content = domCode.textContent;
    code.modified = Date.now();
    Prism.highlightElement(domCode);
  });

  domCode.addEventListener('focus', e => {
    const index = currentNote.content.indexOf(code);
    caretPos = index;
  });

  return code;
}
*/

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