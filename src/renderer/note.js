import NoteBody from "./note-body";
import NoteHead from "./note-head";

export default class Note {
  constructor(head, body, files = []) {
    this.head = head ?? new NoteHead('');
    this.body = body ?? new NoteBody();
    this.files = files;
  }

  addFile(file) {
    this.files.push(file);
  }

  removeFile(file) {
    const index = this.files.indexOf(file);
    this.files.splice(index, 1);
  }

  getFile(filename) {
    return this.files.find(f => f.filename == filename);
  }

  insert(index, element) {
    this.body.children.splice(index, 0, element);
  }

  insertListItem(indexOfList, index, element) {
    this.body.children[indexOfList].content.splice(index, 0, element);
  }

  remove(index) {
    this.body.children.splice(index, 1);
  }

  removeListItem(indexOfList, index) {
    this.body.children[indexOfList].content.splice(index, 1);
  }
}