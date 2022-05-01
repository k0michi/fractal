import * as elements from './elements';

export default class NoteBody {
  constructor(children) {
    this.children = children ?? [elements.createParagraph()];
  }
}