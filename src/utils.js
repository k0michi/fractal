export function removeChildNodes(parent) {
  while (parent.firstChild != null) {
    parent.removeChild(parent.firstChild);
  }
}