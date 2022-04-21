import LibraryItem from "./library-item";
import * as LibraryItemType from "./library-item-type";

export class LibraryFile extends LibraryItem {
  constructor(name, path) {
    super(LibraryItemType.FILE, name, path);
  }
}