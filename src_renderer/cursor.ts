export interface CursorRange {
  start: number;
  end: number;
}

export function visitNodes(node: Node, visitor: (node: Node) => void) {
  const stack:Node[] = [];

  if (node.firstChild != null) {
    stack.push(node.firstChild);
  }

  while (stack.length > 0) {
    const top = stack.pop()!;

    if (top?.nextSibling != null) {
      stack.push(top.nextSibling);
    }

    if (top?.firstChild != null) {
      stack.push(top.firstChild);
    }
    
    visitor(top);
  }
}

export function getCursorRange(parent: Node): CursorRange {
  const selection = window.getSelection()!;
  let { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  let start = 0;
  let end = 0;
  let startReached = false;
  let endReached = false;
  let isAnchorText = true;
  let isFocusText = true;

  // The anchor is located between two nodes
  if (anchorNode?.nodeType == Node.ELEMENT_NODE) {
    // The range of offset is [0, childNodes.length]
    anchorNode = anchorNode.childNodes[anchorOffset];
    isAnchorText = false;
  }

  if (focusNode?.nodeType == Node.ELEMENT_NODE) {
    focusNode = focusNode.childNodes[focusOffset];
    isFocusText = false;
  }

  visitNodes(parent, n => {
    if (n == anchorNode) {
      if (isAnchorText) {
        start += anchorOffset;
      }

      startReached = true;
    }

    if (n == focusNode) {
      if (isFocusText) {
        end += focusOffset;
      }

      endReached = true;
    }

    if (n.nodeType == Node.TEXT_NODE) {
      const t = n as Text;

      if (!startReached) {
        start += t.length;
      }

      if (!endReached) {
        end += t.length;
      }
    }
  });

  return { start, end };
}

export function setCursorRange(parent: Node, cursorRange: CursorRange) {
  const { start, end } = cursorRange;

  let anchorNode, anchorOffset, focusNode, focusOffset;
  let position = 0;

  visitNodes(parent, n => {
    if (n.nodeType == Node.TEXT_NODE) {
      const t = n as Text;
      const length = t.length;

      if (position + length >= start && anchorNode == null) {
        anchorNode = n;
        anchorOffset = start - position;
      }

      if (position + length >= end && focusNode == null) {
        focusNode = n;
        focusOffset = end - position;
      }

      position += length;
    }
  });

  /*
  if (anchorNode == null) {
    anchorNode = parent;
    anchorOffset = parent.childNodes.length;
  }

  if (focusNode == null) {
    focusNode = parent;
    focusOffset = parent.childNodes.length;
  }
  */

  const selection = window.getSelection()!;
  selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
}

export function normalizeRange(range: CursorRange) {
  if (range.end < range.start) {
    return {start:range.end, end:range.start};
  }

  return range;
}