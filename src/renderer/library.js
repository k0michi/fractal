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

  async createCollection(relativePath) {
    await bridge.makeDir(`${this.basePath}/${relativePath}`);
  }

  entsToItems(ents) {
    const items = [];

    for (const ent of ents) {
      const path = ent.path;
      const name = ent.name;

      if (ent.kind == fileKind.FILE) {
        items.push(new LibraryFile(name, path));
      } else {
        const childItems = this.entsToItems(ent.ents);
        items.push(new LibraryCollection(name, path, childItems));
      }
    }

    return items;
  }

  async refresh() {
    const ents = await bridge.readDirRecursive(this.basePath);
    ents.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
    this.items = this.entsToItems(ents);
  }
}