import autoBind from "auto-bind";
import { Observable } from "kyoka";
import AppModel from "./app-model";
import { buildDocument, createBlankBody, createBlankHead, extractHead, Head, parseMIML, parseXML } from "./miml";

export interface NoteEntry {
  path?: string;
  head?: Head;
  children: NoteEntry[];
}

export interface Note {
  head: Head;
  body: Element;
}

export default class Library {
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
      await this.saveNote(rootNote);
    }
  }

  createPath(id: string) {
    let path = '';
    let noteEntry = this.noteEntryByID[id];

    while (noteEntry != null) {
      console.log(noteEntry.head?.id)

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
      console.log(path)
      const content = await bridge.readFileUTF8(path);
      const { head } = parseMIML(content);
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
      path = `${this.libraryPath}/index.miml`
    } else {
      path = `${this.libraryPath}/${parentPath}/${note.head.id}/index.miml`
    }

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

  changeTitle(id:string, title: string) {
    this.noteEntryByID[id].head!.title = title;
    this.updateView();
  }

  updateView() {
    this.rootNote.set(this.rootNote.get());
  }

  async saveNote(note: Note) {
    const path = this.noteEntryByID[note.head.id].path;
    console.log(path)
    const serializer = new XMLSerializer();
    const document = buildDocument(note.head, note.body);
    const serialized = serializer.serializeToString(document);
    await bridge.writeFile(path, serialized);
  }

  onClickItem(note: NoteEntry) {
    this.appModel.openFile(note.path!);
  }

  onClickNew() {
    const note = this.newNote();
    this.register(note);
    this.saveNote(note);
  }
}