import { nanoid } from 'nanoid';

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
import * as fileSystem from './file-system';
import * as LibraryItemType from "./library-item-type";

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
  libraryView.renderFiles(library.items);
}

let $noteContainer;
let currentNote;
let currentNoteFile;
let library;
let focusIndex;

let toolsView = new ToolsView();
let libraryView = new LibraryView();
let noteView = new NoteView();

export function insertBlock(index, element) {
  noteView.insertElement(element, index);
  currentNote.insert(index, element);
}

export function insertListItem(indexOfList, index, element) {
  noteView.insertListItem(element, indexOfList, index);
  currentNote.insertListItem(indexOfList, index, element);
}

export function removeBlock(index) {
  noteView.remove(index);
  currentNote.remove(index);
}

export function removeListItem(indexOfList, index) {
  noteView.removeListItem(indexOfList, index);
  currentNote.removeListItem(indexOfList, index);
}

export function setFocusIndex(index) {
  focusIndex = index;
}

export function insertMath() {
  const math = createMath();
  insertBlock(focusIndex + 1, math);
  focus(focusIndex + 1);
}

export function insertHeader(level) {
  const header = createHeader(level);
  insertBlock(focusIndex + 1, header);
  focus(focusIndex + 1);
}

export function insertHorizontalRule() {
  const horizontal = createHorizontalRule();
  insertBlock(focusIndex + 1, horizontal);
  focus(focusIndex + 1);
}

export function insertBlockquote() {
  const blockquote = createBlockquote();
  insertBlock(focusIndex + 1, blockquote);
  focus(focusIndex + 1);
}

export function insertCode() {
  const code = createCode();
  insertBlock(focusIndex + 1, code);
  focus(focusIndex + 1);
}

export function insertOrderedList() {
  const orderedList = createOrderedList();
  insertBlock(focusIndex + 1, orderedList);
  focus(focusIndex + 1);
}

export function insertUnorderedList() {
  const unorderedList = createUnorderedList();
  insertBlock(focusIndex + 1, unorderedList);
  focus(focusIndex + 1);
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

export async function selectLibraryItem(path, type) {
  if (type == LibraryItemType.FILE) {
    const noteFile = await fileSystem.openNoteFile(path);
    openNoteFile(noteFile);
  }
}

async function getAvailableFileName(name) {
  if (await fileSystem.doesExist(name)) {
    let i = 2;

    while (await fileSystem.doesExist(`${name}_${i}`)) {
      i++;
    }

    name = `${name}_${i}`;
  }

  return name;
}

export async function newNote() {
  let name = `untitled_${utils.dateToString(new Date())}`;
  name = await getAvailableFileName(name);

  const note = new Note(NoteHead.create(name));
  const noteFile = new NoteFile(`${library.basePath}/${name}`, note);
  await saveNoteFile(noteFile);
  await library.refresh();
  libraryView.setSelectedPath(noteFile.path);
  renderFiles();
  openNoteFile(noteFile);
}

export async function newCollection() {
  let name = `untitled_collection_${utils.dateToString(new Date())}`;
  name = await getAvailableFileName(name);

  await library.createCollection(name);
  await library.refresh();
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

export function focus(index) {
  setFocusIndex(index);
  noteView.focus(index);
}

export function focusListItem(indexOfList, index) {
  setFocusIndex(indexOfList);
  noteView.focusListItem(indexOfList, index);
}

export function createParagraph(content = '', created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const id = nanoid();

  const paragraph = {
    type: symbols.PARAGRAPH,
    content,
    created,
    modified,
    id
  };

  return paragraph;
}

export function createMath(content = '', created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const id = nanoid();

  const math = {
    type: symbols.MATH,
    content,
    created,
    modified,
    id
  };

  return math;
}

export function createHeader(level, content = '', created, modified) {
  const type = symbols.headers[level - 1];

  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const id = nanoid();

  const header = {
    type,
    content,
    created,
    modified,
    id
  };

  return header;
}

export function createHorizontalRule(created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const id = nanoid();

  const horizontal = {
    type: symbols.HORIZONTAL_RULE,
    created,
    modified,
    id
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

  const id = nanoid();

  const blockquote = {
    type: symbols.BLOCKQUOTE,
    content,
    created,
    modified,
    id
  };

  return blockquote;
}

export function createCode(content = '', language = 'javascript', created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const id = nanoid();

  const code = {
    type: symbols.CODE,
    content,
    created,
    modified,
    language,
    id
  };

  return code;
}

export function createListItem(content = '', created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const id = nanoid();

  const code = {
    type: symbols.LIST_ITEM,
    content,
    created,
    modified,
    id
  };

  return code;
}

export function createOrderedList(content = [createListItem()], created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const id = nanoid();

  const code = {
    type: symbols.ORDERED_LIST,
    content,
    created,
    modified,
    id
  };

  return code;
}

export function createUnorderedList(content = [createListItem()], created, modified) {
  if (created == null) {
    created = Date.now();
  }

  if (modified == null) {
    modified = created;
  }

  const id = nanoid();

  const code = {
    type: symbols.UNORDERED_LIST,
    content,
    created,
    modified,
    id
  };

  return code;
}