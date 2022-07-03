import autoBind from "auto-bind";
import { Observable } from "kyoka";
import AppModel from "./app-model";
import { buildDocument, createBlankBody, createBlankHead, parseFML, parseXML } from "./fml";
import {Head, NoteEntry, Note} from './note';

export default class LibraryModel {
  libraryPath: string;
  appModel: AppModel;
  noteEntryByID: { [id: string]: NoteEntry } = {};
  rootNote = new Observable<NoteEntry | null>(null);

  constructor(appModel: AppModel) {
    this.appModel = appModel;
    autoBind(this);
  }

  async initialize() {
    this.libraryPath = await bridge.getLibraryPath();
    await bridge.makeLibraryDir();
    await this.loadNotes();

    if (this.rootNote.get() == null) {
      const rootNote = this.newNote();
      this.register(rootNote);
      await this.appModel.saveNote(rootNote);
    }
  }

  createPath(id: string) {
    let path = '';
    let noteEntry = this.noteEntryByID[id];

    while (noteEntry != null) {
      if (noteEntry.head?.parent != null) {
        path = noteEntry.head?.id + '/' + path;
      }

      noteEntry = this.noteEntryByID[noteEntry.head?.parent];
    }

    return path;
  }

  async loadNotes() {
    const files = await bridge.globNodes();

    for (const path of files) {
      const content = await bridge.readFileUTF8(path);
      const { head } = parseFML(content);
      const id = head.id!;
      const parent = head.parent;

      if (!(id in this.noteEntryByID)) {
        this.noteEntryByID[id] = { children: [] };
      }

      this.noteEntryByID[id].path = path;
      this.noteEntryByID[id].head = head;

      if (parent == null) {
        this.rootNote.set(this.noteEntryByID[id]);
      } else {
        if (!(parent in this.noteEntryByID)) {
          this.noteEntryByID[parent] = { children: [] };
        }

        this.noteEntryByID[parent].children.push(this.noteEntryByID[id]);
      }
    }
  }

  newNote(): Note {
    const head = createBlankHead(this.rootNote.get()?.head?.id);
    const body = createBlankBody();
    return { head, body };
  }

  register(note: Note) {
    const parent = note.head.parent as string;
    const parentPath = this.createPath(parent);
    let path: string;

    if (parent == null) {
      path = `${this.libraryPath}/index.fml`
    } else {
      path = `${this.libraryPath}/${parentPath}/${note.head.id}/index.fml`
    }

    note.path = path;
    const entry: NoteEntry = { path, head: note.head, children: [] };
    this.noteEntryByID[note.head.id] = entry;

    if (parent == null) {
      this.rootNote.set(entry);
    } else {
      this.noteEntryByID[parent].children.push(entry);
      this.updateView();
    }

    return entry;
  }

  changeTitle(id: string, title: string) {
    this.noteEntryByID[id].head!.title = title;
    this.updateView();
  }

  updateView() {
    this.rootNote.set(this.rootNote.get());
  }

  onClickItem(note: NoteEntry) {
    this.appModel.openNoteFromPath(note.path!);
  }

  async onClickNew() {
    const note = this.newNote();
    this.register(note);
    await this.appModel.saveNote(note);
    this.appModel.openNote(note);
  }
}