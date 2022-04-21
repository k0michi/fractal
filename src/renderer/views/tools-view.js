import { insertBlockquote, insertCode, insertHeader, insertHorizontalRule, insertMath, insertOrderedList, insertUnorderedList, newNote, saveCurrentNoteFile, selectAndOpenNoteBook } from "../main";

export default class ToolsView {
  constructor() {
  }

  initialize() {
    document.getElementById('ins-math').addEventListener('click', e => {
      insertMath();
    });

    for (let i = 1; i <= 6; i++) {
      document.getElementById('ins-h' + i).addEventListener('click', e => {
        insertHeader(i);
      });
    }

    document.getElementById('ins-hr').addEventListener('click', e => {
      insertHorizontalRule();
    });

    document.getElementById('ins-blockquote').addEventListener('click', e => {
      insertBlockquote();
    });

    document.getElementById('ins-code').addEventListener('click', e => {
      insertCode();
    });

    document.getElementById('ins-ol').addEventListener('click', e => {
      insertOrderedList();
    });

    document.getElementById('ins-ul').addEventListener('click', e => {
      insertUnorderedList();
    });

    document.getElementById('save').addEventListener('click', async e => {
      await saveCurrentNoteFile();
    });

    document.getElementById('open').addEventListener('click', async e => {
      await selectAndOpenNoteBook();
    });

    document.getElementById('new').addEventListener('click', async e => {
      await newNote();
    });
  }
}