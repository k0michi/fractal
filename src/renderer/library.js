import LibraryItem from "./library-item";
import Note from "./note";
import NoteFile from "./note-file";
import * as fileKind from "../file-kind";
import { LibraryFile } from "./library-file";
import LibraryCollection from "./library-collection";

export default class Library {
  constructor(basePath) {
    this.basePath = basePath;
  }

  async initialize() {
    await bridge.makeDir(this.basePath);
    await this.refresh();
  }

  async refresh() {
    const ents = await bridge.readDir(this.basePath);
    ents.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));

    this.items = [];

    for (const ent of ents) {
      const path = ent.path;
      const name = ent.name;

      if (ent.kind == fileKind.FILE) {
        this.items.push(new LibraryFile(name, path));
      } else {
        this.items.push(new LibraryCollection(name, path));
      }
    }
  }

  async doesExist(filename) {
    const path = `${this.basePath}/${filename}`;
    return await bridge.doesExist(path);
  }

  async open(filename) {
    const path = `${this.basePath}/${filename}`;
    const text = await bridge.readFile(path);
    const noteFile = new NoteFile(path, Note.fromXML(text));
    return noteFile;
  }
}