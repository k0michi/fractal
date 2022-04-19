import Katex from 'katex';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';

import * as utils from './utils';
import Note from './note';
import NoteFile from './note-file';
import Library from './library';
import NoteHead from './note-head';
import * as symbols from './symbols';

import './styles.css';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism.css';
import ToolsView from './views/tools-view';
import LibraryView from './views/library-view';
import NoteView from './views/note-view';

/*
class App {
  constructor() {
    window.addEventListener('load', this.onLoad);
  }

  onLoad() {
    
  }
}

const app = new App();
*/

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
  currentNoteFile = noteFile;
  currentNote = noteFile.note;
  libraryView.setSelectedPath(currentNoteFile.path);
  renderFiles();
  renderNote(noteFile.note);
}

function renderNote(note) {
  utils.removeChildNodes($noteContainer);
  $noteContainer.append(noteView.$note);
  noteView.render(note);
}

function renderFiles() {
  libraryView.renderFiles(library.files);
}

let $noteContainer;
let currentNote;
let currentNoteFile;
let caretPos = 0;
let library;
let isComposing = false;

let toolsView = new ToolsView();
let libraryView = new LibraryView();
let noteView = new NoteView();

function insertBlock(index, element) {
  if (index >= currentNote.body.children.length) {
    noteView.insertElement(element.element, null);
  } else {
    noteView.insertElement(element.element, currentNote.body.children[index].element);
  }

  currentNote.insert(index, element);
}

function removeBlock(index) {
  currentNote.body.children[index].element.remove();
  currentNote.remove(index);
}

export function insertMath() {
  const math = createMath();
  insertBlock(caretPos + 1, math);
}

export function insertHeader(level) {
  const header = createHeader(level);
  insertBlock(caretPos + 1, header);
}

export function insertHorizontalRule() {
  const horizontal = createHorizontalRule();
  insertBlock(caretPos + 1, horizontal);
}

export function insertBlockquote() {
  const blockquote = createBlockquote();
  insertBlock(caretPos + 1, blockquote);
}

export function insertCode() {
  const code = createCode();
  insertBlock(caretPos + 1, code);
}

export async function saveCurrentNoteFile() {
  await saveNoteFile(currentNoteFile);
}

export async function selectAndOpenNoteBook() {
  const file = await bridge.openFile();
  const xml = await bridge.readFile(file);
  const note = Note.fromXML(xml);
  const noteFile = new NoteFile(file, note);
  openNoteFile(noteFile);
}

export async function selectLibraryItem(filename) {
  const noteFile = await library.open(filename);
  openNoteFile(noteFile);
}

export async function newNote() {
  let name = `untitled_${utils.dateToString(new Date())}`;

  if (await library.doesExist(name)) {
    let i = 2;

    while (await library.doesExist(`${name}_${i}`)) {
      i++;
    }

    name = `${name}_${i}`;
  }

  currentNote = new Note(NoteHead.create(name));
  currentNoteFile = new NoteFile(`${library.basePath}/${name}`, currentNote);
  await saveNoteFile(currentNoteFile);
  await library.refresh();
  libraryView.setSelectedPath(currentNoteFile.path);
  renderFiles();
}

window.addEventListener('load', async () => {
  $noteContainer = document.getElementById('note-container');

  toolsView.initialize();
  libraryView.initialize();

  const userDataPath = await bridge.getPath('userData');
  const libraryPath = `${userDataPath}/library`;
  library = new Library(libraryPath);
  await library.initialize();
  renderFiles();

  const emptyNote = new Note(NoteHead.create('Untitled'));
  const emptyNoteFile = new NoteFile(null, emptyNote);
  openNoteFile(emptyNoteFile);
});

function focus(index) {
  currentNote.body.children[index]?.element.focus();
}

window.addEventListener('compositionstart', e => {
  isComposing = true;
});

window.addEventListener('compositionend', e => {
  isComposing = false;
});

export function createParagraph(content = '', created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const paragraph = {
    type: symbols.PARAGRAPH,
    content,
    created,
    modified
  };

  const $paragraph = buildParagraph(paragraph);
  paragraph.element = $paragraph;
  return paragraph;
}

function buildParagraph(paragraph) {
  const $paragraph = document.createElement('p');
  $paragraph.style = 'overflow-wrap: anywhere; width: 100%;';
  $paragraph.contentEditable = true;
  $paragraph.textContent = paragraph.content;

  $paragraph.addEventListener('keydown', e => {
    const index = currentNote.body.children.indexOf(paragraph);
    caretPos = index;

    const selection = window.getSelection();
    const selectionRange = utils.getCursorRange($paragraph);

    if (e.key == 'Enter' && !isComposing) {
      const nextParagraph = createParagraph();
      insertBlock(index + 1, nextParagraph);
      focus(index + 1);
      e.preventDefault();
    }

    if (e.key == 'Backspace' && selection.isCollapsed && selectionRange.start == 0) {
      removeBlock(index);
      focus(index - 1);
      e.preventDefault();
    }

    if (e.key == 'ArrowUp' && selection.isCollapsed && selectionRange.start == 0) {
      focus(index - 1);
    }

    if (e.key == 'ArrowDown' && selection.isCollapsed && selectionRange.start == $paragraph.textContent.length) {
      focus(index + 1);
    }
  });

  $paragraph.addEventListener('input', e => {
    paragraph.content = $paragraph.textContent;
    paragraph.modified = Date.now();
  });

  $paragraph.addEventListener('focus', e => {
    const index = currentNote.body.children.indexOf(paragraph);
    caretPos = index;
  });

  $paragraph.addEventListener('paste', e => {
    const paste = (e.clipboardData ?? window.clipboardData).getData('text');
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      selection.collapseToEnd();
      $paragraph.normalize();
      paragraph.content = $paragraph.textContent;
      paragraph.modified = Date.now();
    }

    e.preventDefault();
  });

  return $paragraph;
}

export function createMath(content = '', created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const math = {
    type: symbols.MATH,
    content,
    created,
    modified
  };

  const $container = buildMath(math);
  math.element = $container;
  return math;
}

export function buildMath(math) {
  const $container = document.createElement('div');
  $container.className = 'math';
  const $editor = document.createElement('pre');
  $editor.style = 'overflow-wrap: anywhere; width: 100%;';
  $editor.contentEditable = true;

  $editor.textContent = math.content;
  Katex.render(math.content, $container, { displayMode: true });

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
    const index = currentNote.body.children.indexOf(math);
    caretPos = index;
  });

  return $container;
}

export function createHeader(level, content = '', created, modified) {
  const type = symbols.headers[level - 1];

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const header = {
    type,
    content,
    created,
    modified
  };

  const $header = buildHeader(header);
  header.element = $header;

  return header;
}

function buildHeader(header) {
  const $header = document.createElement(header.type);
  $header.textContent = header.content;
  $header.style = 'overflow-wrap: anywhere; width: 100%;';
  $header.contentEditable = true;

  $header.addEventListener('input', e => {
    header.content = $header.textContent;
    header.modified = Date.now();
  });

  $header.addEventListener('focus', e => {
    const index = currentNote.body.children.indexOf(header);
    caretPos = index;
  });

  return $header;
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
    type: symbols.HORIZONTAL_RULE,
    element: $hr,
    created,
    modified
  };

  return horizontal;
}

export function createBlockquote(content = '', created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const blockquote = {
    type: symbols.BLOCKQUOTE,
    content,
    created,
    modified
  };

  const $blockquote = buildBlockquote(blockquote);
  blockquote.element = $blockquote;
  return blockquote;
}

function buildBlockquote(blockquote) {
  const $blockquote = document.createElement('blockquote');
  $blockquote.textContent = blockquote.content;
  $blockquote.style = 'overflow-wrap: anywhere; width: 100%;';
  $blockquote.contentEditable = true;

  $blockquote.addEventListener('input', e => {
    blockquote.content = $blockquote.textContent;
    blockquote.modified = Date.now();
  });

  $blockquote.addEventListener('focus', e => {
    const index = currentNote.body.children.indexOf(blockquote);
    caretPos = index;
  });

  return $blockquote;
}

function buildLanguageSelect(selected) {
  const $select = document.createElement('select');
  $select.style = 'display: block;';
  $select.name = 'language';

  for (let language of symbols.languages) {
    const $option = document.createElement('option');
    $option.value = language.id;
    $option.text = language.name;
    $select.append($option);
  }

  $select.value = selected;
  return $select;
}

function setLanguage(language, $pre, $code) {
  $code.className = `language-${language}`;
  $pre.className = `language-${language}`;
}

export function createCode(content = '', language = 'javascript', created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const code = {
    type: symbols.CODE,
    content,
    created,
    modified,
    language
  };

  const $pre = buildCode(code);
  code.element = $pre;
  return code;
}

function buildCode(code) {
  const $pre = document.createElement('pre');
  const $langSelect = buildLanguageSelect(code.language);
  const $code = document.createElement('code');
  $code.style = 'display: inline-block; width: 100%;';
  $pre.append($langSelect);
  $pre.append($code);
  $code.textContent = code.content;
  $code.contentEditable = true;

  if (code.language != null) {
    setLanguage(code.language, $pre, $code);
  }

  Prism.highlightElement($code, false);

  $code.addEventListener('input', e => {
    code.content = $code.textContent;
    code.modified = Date.now();

    if (!isComposing) {
      // Work around for the problem that the cursor goes to the beginning after highlighting
      const range = utils.getCursorRange($code);
      Prism.highlightElement($code, false);
      utils.setCursorRange($code, range);
    }
  });

  $langSelect.addEventListener('change', e => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage, $pre, $code);
    Prism.highlightElement($code, false);
    code.language = newLanguage;
  });

  $code.addEventListener('focus', e => {
    const index = currentNote.body.children.indexOf(code);
    caretPos = index;
  });

  $code.addEventListener('paste', e => {
    const paste = (e.clipboardData ?? window.clipboardData).getData('text');
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      selection.collapseToEnd();
      $code.normalize();
      const range = utils.getCursorRange($code, selection);
      Prism.highlightElement($code, false);
      utils.setCursorRange($code, range);
      code.content = $code.textContent;
      code.modified = Date.now();
    }

    e.preventDefault();
  });

  return $pre;
}