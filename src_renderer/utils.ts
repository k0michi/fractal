export function removeChildNodes(parent: Element) {
  while (parent.firstChild != null) {
    parent.removeChild(parent.firstChild);
  }
}