import { selectLibraryItem } from "../main";
import { removeChildNodes } from "../utils";
import * as LibraryItemType from "../library-item-type";

export default class LibraryView {
  constructor() {
    this.toggleCollection = new Map();
  }

  initialize() {
    this.$library = document.getElementById('library');

    this.$library.addEventListener('click', async e => {
      if (e.target.classList.contains('library-item')) {
        const path = e.target.dataset.path;
        const type = e.target.dataset.type;

        if (e.target.dataset.type == LibraryItemType.COLLECTION) {
          let toggle = this.toggleCollection.get(e.target.dataset.path) ?? false;
          toggle = !toggle;
          this.toggleCollection.set(e.target.dataset.path, toggle);
        }

        selectLibraryItem(path, type);
      }
    });
  }

  setSelectedPath(path) {
    this.selectedPath = path;
  }

  renderFiles(items) {
    removeChildNodes(this.$library);

    for (const i of items) {
      if (i.type == LibraryItemType.FILE) {
        const $item = document.createElement('div');
        $item.classList.add('library-item');
        $item.classList.add('library-file');
        $item.textContent = i.name;
        $item.dataset.path = i.path;
        $item.dataset.type = i.type;

        if (i.path == this.selectedPath) {
          $item.classList.add('selected');
        }

        this.$library.append($item);
      } else {
        const $item = document.createElement('div');
        const toggle = this.toggleCollection.get(i.path) ?? false;
        $item.classList.add('library-item');
        $item.classList.add('library-collection');

        if (toggle) {
          $item.classList.add('open');
        }

        $item.textContent = i.name;
        $item.dataset.path = i.path;
        $item.dataset.type = i.type;

        if (i.path == this.selectedPath) {
          $item.classList.add('selected');
        }

        this.$library.append($item);
      }
    }
  }
}