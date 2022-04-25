import { nanoid } from "nanoid";

export default class NoteFile {
  constructor(path, note) {
    this.path = path;
    this.note = note;
    this.id = nanoid();
  }
}