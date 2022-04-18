import { selectLibraryItem } from "../main";
import { removeChildNodes } from "../utils";

export default class LibraryView {
  constructor() {

  }

  initialize() {
    this.$library = document.getElementById('library');

    this.$library.addEventListener('click', async e => {
      if (e.target.classList.contains('library-item')) {
        const filename = e.target.textContent;
        selectLibraryItem(filename);
      }
    });
  }

  setSelectedPath(path) {
    this.selectedPath = path;
  }

  renderFiles(items) {
    removeChildNodes(this.$library);
  
    for (const i of items) {
      const $item = document.createElement('div');
      $item.classList.add('library-item');
      $item.textContent = i.name;
      $item.dataset.path = i.path;
  
      if (i.path == this.selectedPath) {
        $item.classList.add('selected');
      }
  
      this.$library.append($item);
    }
  }
}