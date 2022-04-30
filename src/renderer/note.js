import NoteBody from "./note-body";
import NoteHead from "./note-head";

export default class Note {
  constructor(head, body) {
    this.head = head ?? new NoteHead('');
    this.body = body ?? new NoteBody();
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