import { nanoid } from 'nanoid';
import * as path from 'path-browserify';
import { filetypemime } from 'magic-bytes.js';

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
import TabView from './views/tab-view';
import * as skml from './skml';
import * as archive from './archive';

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

  // await bridge.writeFile(noteFile.path, skml.toSKML(noteFile.note));
  await bridge.writeBinaryFile(noteFile.path, await archive.toArchive(noteFile.note));
}

function openNoteFile(noteFile) {
  currentNoteFile = noteFile;
  currentNote = noteFile.note;
  libraryView.setSelectedPath(currentNoteFile.path);
  renderFiles();
  renderNote(noteFile.note);

  if (!openedFiles.includes(noteFile)) {
    openedFiles.push(noteFile);
    addTab(currentNoteFile);
  }
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
let openedFiles = [];
let currentNote;
let currentNoteFile;
let library;
let focusIndex;

let toolsView = new ToolsView();
let libraryView = new LibraryView();
let noteView = new NoteView();
let tabView = new TabView();

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

export async function insertImage() {
  const imagePath = await bridge.openFile();
  const data = await bridge.readBinaryFile(imagePath);
  const filename = path.basename(imagePath);
  const mediaType = filetypemime(data)[0];
  const image = createImage(data, filename, mediaType);
  insertBlock(focusIndex + 1, image);
  focus(focusIndex + 1);
}

export async function saveCurrentNoteFile() {
  await saveNoteFile(currentNoteFile);
}

export async function openNoteBookViaDialog() {
  const path = await bridge.openFile();
  let noteFile = getOpenedNoteBookFromPath(path);

  if (noteFile == null) {
    const xml = await bridge.readFile(path);
    const note = skml.fromSKML(xml);
    noteFile = new NoteFile(path, note)
  }

  openNoteFile(noteFile);
}

export async function selectLibraryItem(path, type) {
  if (type == LibraryItemType.FILE) {
    let noteFile = getOpenedNoteBookFromPath(path);

    if (noteFile == null) {
      noteFile = await fileSystem.openNoteFile(path);
    }

    openNoteFile(noteFile);
  } else {
    libraryView.setSelectedPath(path);
    renderFiles();
  }
}

function joinExtension(name, ext) {
  return ext == null ? name : `${name}.${ext}`;
}

async function getAvailableFileName(dir, name, ext) {
  if (await fileSystem.doesExist(dir, joinExtension(name, ext))) {
    let i = 2;

    while (await fileSystem.doesExist(dir, joinExtension(`${name}_${i}`, ext))) {
      i++;
    }

    name = `${name}_${i}`;
  }

  return name;
}

export async function newNote() {
  let name = `untitled_${utils.dateToString(new Date())}`;
  name = await getAvailableFileName(library.basePath, name, 'sk');
  const filename = name + '.sk';

  const note = new Note(NoteHead.create(name));
  const noteFile = new NoteFile(`${library.basePath}/${filename}`, note);
  await saveNoteFile(noteFile);
  await library.refresh();
  libraryView.setSelectedPath(noteFile.path);
  renderFiles();
  openNoteFile(noteFile);
}

export async function newCollection() {
  let name = `untitled_collection`;
  name = await getAvailableFileName(library.basePath, name);

  await library.createCollection(name);
  await library.refresh();
  renderFiles();
}

export function addTab(noteFile) {
  tabView.addTab(noteFile.id, noteFile.note.head.properties.title);
}

export function switchTab(noteFileID) {
  const noteFile = getOpenedNoteBookFromID(noteFileID);
  openNoteFile(noteFile);
}

export function getOpenedNoteBookFromID(noteFileID) {
  return openedFiles.find(noteBook => noteBook.id == noteFileID);
}

export function getOpenedNoteBookFromPath(path) {
  return openedFiles.find(noteBook => noteBook.path == path);
}

export function removeOpened(noteFileID) {
  const index = openedFiles.findIndex(noteBook => noteBook.id == noteFileID);

  if (index != -1) {
    openedFiles.splice(index, 1);
  }
}

export function clearNote() {
  noteView.clear();
}

export function closeTab(noteFileID) {
  removeOpened(noteFileID);
  const previous = tabView.getIDOfPrevious(noteFileID);
  tabView.removeTab(noteFileID);

  if (previous == null) {
    clearNote();
  } else {
    const noteFile = getOpenedNoteBookFromID(previous);
    openNoteFile(noteFile);
  }
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

  const emptyNote = new Note(NoteHead.create('untitled'));
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

export function changeTitle(newTitle) {
  currentNote.head.properties.title = newTitle;
}

export function createParagraph(content = '') {
  const id = nanoid();

  const paragraph = {
    type: symbols.PARAGRAPH,
    content,
    id
  };

  return paragraph;
}

export function createMath(content = '') {
  const id = nanoid();

  const math = {
    type: symbols.MATH,
    content,
    id
  };

  return math;
}

export function createHeader(level, content = '') {
  const type = symbols.headers[level - 1];

  const id = nanoid();

  const header = {
    type,
    content,
    id
  };

  return header;
}

export function createHorizontalRule() {
  const id = nanoid();

  const horizontal = {
    type: symbols.HORIZONTAL_RULE,
    id
  };

  return horizontal;
}

export function createBlockquote(content = '') {
  const id = nanoid();

  const blockquote = {
    type: symbols.BLOCKQUOTE,
    content,
    id
  };

  return blockquote;
}

export function createCode(content = '', language = 'javascript') {
  const id = nanoid();

  const code = {
    type: symbols.CODE,
    content,
    language,
    id
  };

  return code;
}

export function createListItem(content = '') {
  const id = nanoid();

  const code = {
    type: symbols.LIST_ITEM,
    content,
    id
  };

  return code;
}

export function createOrderedList(content = [createListItem()]) {
  const id = nanoid();

  const code = {
    type: symbols.ORDERED_LIST,
    content,
    id
  };

  return code;
}

export function createUnorderedList(content = [createListItem()]) {
  const id = nanoid();

  const code = {
    type: symbols.UNORDERED_LIST,
    content,
    id
  };

  return code;
}

export function createImage(data, filename, mediaType) {
  const id = nanoid();

  const image = {
    type: symbols.IMAGE,
    data,
    filename,
    mediaType,
    id
  };

  return image;
}