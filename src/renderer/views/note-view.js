import * as utils from '../utils';

export default class NoteView {
  constructor() {
    this.$note = document.createElement('div');
    this.$note.id = 'note';
    this.$noteContent = document.createElement('div');
    this.$noteContent.id = 'note-content';
    this.$note.append(this.$noteContent);
  }

  insertElement(element, index) {
    this.$noteContent.insertBefore(element, index);
  }

  render(note) {
    utils.removeChildNodes(this.$noteContent);
    const $h1 = document.createElement('h1');
    $h1.id = 'title';
    $h1.textContent = note.head.properties.title;
    this.$noteContent.append($h1);

    for (const e of note.body.children) {
      this.$noteContent.append(e.element);
    }
  }
}