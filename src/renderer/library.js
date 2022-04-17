import Note from "./note";
import NoteFile from "./note-file";

export default class Library {
  constructor(basePath) {
    this.basePath = basePath;
  }

  async initialize() {
    await bridge.makeDir(this.basePath);
    await this.refresh();
  }

  async refresh() {
    const files = await bridge.readDir(this.basePath, false);
    files.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

    this.files = files;
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