import LibraryItem from "./library-item";

export default class LibraryCollection extends LibraryItem {
  constructor(name, path, items) {
    super(name, path);
    this.items = items;
  }
}