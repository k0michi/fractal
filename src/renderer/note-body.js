import { createParagraph } from "./main";

export default class NoteBody {
  constructor(children) {
    this.children = children ?? [createParagraph()];
  }
}