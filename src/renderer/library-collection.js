import LibraryItem from "./library-item";
import * as LibraryItemType from "./library-item-type";

export default class LibraryCollection extends LibraryItem {
  constructor(name, path, items) {
    super(LibraryItemType.COLLECTION, name, path);
    this.items = items;
  }
}