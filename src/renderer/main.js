import Katex from 'katex';
import Prism from 'prismjs';

import * as utils from './utils';
import Note from './note';
import NoteFile from './note-file';
import Library from './library';

import './styles.css';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism.css';

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

export const headers = [HEADER1, HEADER2, HEADER3, HEADER4, HEADER5, HEADER6];

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

function openNoteFile(noteFile) {
  const $selected = $library.querySelector('.selected');
  $selected?.classList.remove('selected');
  const $toSelect = $library.querySelector(`[data-path='${noteFile.path}']`);
  $toSelect?.classList.add('selected');

  currentNoteFile = noteFile;
  currentNote = noteFile.note;
  renderNote(noteFile.note);
}

function renderNote(note) {
  utils.removeChildNodes($noteContainer);
  $noteContainer.append(note.noteView.$note);
  note.noteView.render(note);
}

function renderFiles() {
  utils.removeChildNodes($library);

  for (const f of library.files) {
    const $item = document.createElement('div');
    $item.classList.add('library-item');
    $item.textContent = f.name;
    $item.dataset.path = f.path;

    if (currentNoteFile.path == f.path) {
      $item.classList.add('selected');
    }

    $library.append($item);
  }
}

let $noteContainer;
let currentNote;
let currentNoteFile;
let caretPos = 0;
let library;
let $library;

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
  $library = document.getElementById('library');

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
  */

  document.getElementById('ins-code').addEventListener('click', e => {
    const code = createCode();
    currentNote.append(caretPos + 1, code);
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
    await saveNoteFile(currentNoteFile);
  });

  document.getElementById('open').addEventListener('click', async e => {
    const file = await bridge.openFile();
    const xml = await bridge.readFile(file);
    const note = Note.fromXML(xml);
    const noteFile = new NoteFile(file, note);
    openNoteFile(noteFile);
  });

  const emptyNote = new Note();
  const emptyNoteFile = new NoteFile(null, emptyNote);
  openNoteFile(emptyNoteFile);

  const userDataPath = await bridge.getPath('userData');
  const libraryPath = `${userDataPath}/library`;
  library = new Library(libraryPath);
  await library.initialize();
  renderFiles();

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

  $library.addEventListener('click', async e => {
    if (e.target.classList.contains('library-item')) {
      const filename = e.target.textContent;
      const noteFile = await library.open(filename);
      openNoteFile(noteFile);
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
  currentNote.content[index]?.element.focus();
}

let isComposing = false;

window.addEventListener('compositionstart', e => {
  isComposing = true;
});

window.addEventListener('compositionend', e => {
  isComposing = false;
});

export function createParagraph(content = '', created, modified) {
  const $paragraph = document.createElement('p');
  $paragraph.style = 'overflow-wrap: anywhere; width: 100%;';
  $paragraph.contentEditable = true;
  $paragraph.textContent = content;

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const paragraph = {
    type: PARAGRAPH,
    content,
    element: $paragraph,
    created,
    modified
  };

  $paragraph.addEventListener('keydown', e => {
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
      focus(index - 1);
    }

    // FIX ME
    if (e.key == 'ArrowDown' && currentNote.content.length && selection.isCollapsed && selection.anchorOffset == paragraph.content.length) {
      focus(index + 1);
    }
  });

  $paragraph.addEventListener('input', e => {
    paragraph.content = $paragraph.textContent;
    paragraph.modified = Date.now();
  });

  $paragraph.addEventListener('focus', e => {
    const index = currentNote.content.indexOf(paragraph);
    caretPos = index;
  });

  $paragraph.addEventListener('paste', e => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      selection.collapseToEnd();
      $paragraph.normalize();
      paragraph.content = $paragraph.textContent;
    }

    e.preventDefault();
  });

  return paragraph;
}

export function createMath(content = '', created, modified) {
  const $container = document.createElement('div');
  $container.className = 'math';
  const $editor = document.createElement('pre');
  $editor.style = 'overflow-wrap: anywhere; width: 100%;';
  $editor.contentEditable = true;

  $editor.textContent = content;
  Katex.render(content, $container, { displayMode: true });

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const math = {
    type: MATH,
    content,
    element: $container,
    created,
    modified
  };

  window.addEventListener('click', e => {
    if ($container.contains(e.target) && ($container.firstChild == null || $container.firstChild != $editor)) {
      if ($container.firstChild != null) {
        $container.removeChild($container.firstChild);
      }

      $container.append($editor);
      $editor.focus();
    } else if (!$container.contains(e.target) && ($container.firstChild == null || !$container.firstChild.classList.contains('katex-display'))) {
      if ($container.firstChild != null) {
        $container.removeChild($container.firstChild);
      }

      Katex.render(math.content, $container, { displayMode: true });
    }
  });

  $editor.addEventListener('input', e => {
    math.content = $editor.textContent;
    math.modified = Date.now();
  });

  $editor.addEventListener('focus', e => {
    const index = currentNote.content.indexOf(math);
    caretPos = index;
  });

  return math;
}

export function createHeader(level, content = '', created, modified) {
  const type = headers[level - 1];
  const $header = document.createElement(type);
  $header.textContent = content;
  $header.style = 'overflow-wrap: anywhere; width: 100%;';
  $header.contentEditable = true;

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const header = {
    type,
    content,
    element: $header,
    created,
    modified
  };

  $header.addEventListener('input', e => {
    header.content = $header.textContent;
    header.modified = Date.now();
  });

  $header.addEventListener('focus', e => {
    const index = currentNote.content.indexOf(header);
    caretPos = index;
  });

  return header;
}

export function createHorizontalRule(created, modified) {
  const $hr = document.createElement('hr');

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const horizontal = {
    type: HORIZONTAL_RULE,
    element: $hr,
    created,
    modified
  };

  return horizontal;
}

export function createBlockquote(content = '', created, modified) {
  const $blockquote = document.createElement('blockquote');
  $blockquote.textContent = content;
  $blockquote.style = 'overflow-wrap: anywhere; width: 100%;';
  $blockquote.contentEditable = true;

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const blockquote = {
    type: BLOCKQUOTE,
    content,
    element: $blockquote,
    created,
    modified
  };

  $blockquote.addEventListener('input', e => {
    blockquote.content = $blockquote.textContent;
    blockquote.modified = Date.now();
  });

  $blockquote.addEventListener('focus', e => {
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
*/

export function createCode(content = '', language = 'javascript', created, modified) {
  const $pre = document.createElement('pre');
  const $code = document.createElement('code');
  $pre.append($code);
  $code.textContent = content;
  $code.contentEditable = true;

  if (language != null) {
    $code.classList.add(`language-${language}`);
    $pre.classList.add(`language-${language}`);
  }

  Prism.highlightElement($code, false);

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const code = {
    type: CODE,
    content,
    element: $pre,
    created,
    modified,
    language
  };

  $code.addEventListener('input', e => {
    code.content = $code.textContent;
    code.modified = Date.now();

    if (!isComposing) {
      // Work around for the problem that the cursor goes to the beginning after highlighting
      const range = getCursorRange($code);
      Prism.highlightElement($code, false);
      setCursorRange($code, range);
    }
  });

  $code.addEventListener('focus', e => {
    const index = currentNote.content.indexOf(code);
    caretPos = index;
  });

  return code;
}

function visitNodes(element, visitor) {
  const stack = [];

  if (element.firstChild != null) {
    stack.push(element.firstChild);
  }

  while (stack.length > 0) {
    const top = stack.pop();
    visitor(top);

    if (top.nextSibling != null) {
      stack.push(top.nextSibling);
    }

    if (top.firstChild != null) {
      stack.push(top.firstChild);
    }
  }
}

function getCursorRange(parent) {
  const selection = window.getSelection();
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  let start = 0;
  let end = 0;
  let startReached = false;
  let endReached = false;

  visitNodes(parent, n => {
    if (n == anchorNode) {
      start += anchorOffset;
      startReached = true;
    }

    if (n == focusNode) {
      end += focusOffset;
      endReached = true;
    }

    if (n.nodeType == Node.TEXT_NODE) {
      if (!startReached) {
        start += n.length;
      }

      if (!endReached) {
        end += n.length;
      }
    }
  });

  return { start, end };
}

function setCursorRange(parent, cursorRange) {
  const { start, end } = cursorRange;

  let anchorNode, anchorOffset, focusNode, focusOffset;
  let position = 0;

  visitNodes(parent, n => {
    if (n.nodeType == Node.TEXT_NODE) {
      const length = n.length;

      if (position + length > start && anchorNode == null) {
        anchorNode = n;
        anchorOffset = start - position;
      }

      if (position + length > end && focusNode == null) {
        focusNode = n;
        focusOffset = end - position;
      }

      position += length;
    }
  });

  if (anchorNode == null) {
    anchorNode = parent;
    anchorOffset = parent.childNodes.length;
  }

  if (focusNode == null) {
    focusNode = parent;
    focusOffset = parent.childNodes.length;
  }

  const selection = window.getSelection();
  selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
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