import * as utils from './utils';

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

    for (const e of note.content) {
      this.$noteContent.append(e.element);
    }
  }
}