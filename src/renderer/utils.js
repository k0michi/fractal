export function removeChildNodes(parent) {
  while (parent.firstChild != null) {
    parent.removeChild(parent.firstChild);
  }
}

export function dateToString(date) {
  return `${padZero(date.getFullYear(), 4)}-${padZero(date.getMonth() + 1, 2)}-${padZero(date.getDate(), 2)}`;
}

export function padZero(value, n) {
  return value.toString().padStart(n, '0');
}

export function visitNodes(element, visitor) {
  const stack = [];

  if (element.firstChild != null) {
    stack.push(element.firstChild);
  }

  while (stack.length > 0) {
    const top = stack.pop();
    visitor(top);

    if (top.nextSibling != null) {
      stack.push(top.nextSibling);
    }

    if (top.firstChild != null) {
      stack.push(top.firstChild);
    }
  }
}

export function getCursorRange(parent) {
  const selection = window.getSelection();
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  let start = 0;
  let end = 0;
  let startReached = false;
  let endReached = false;

  visitNodes(parent, n => {
    if (n == anchorNode) {
      start += anchorOffset;
      startReached = true;
    }

    if (n == focusNode) {
      end += focusOffset;
      endReached = true;
    }

    if (n.nodeType == Node.TEXT_NODE) {
      if (!startReached) {
        start += n.length;
      }

      if (!endReached) {
        end += n.length;
      }
    }
  });

  return { start, end };
}

export function setCursorRange(parent, cursorRange) {
  const { start, end } = cursorRange;

  let anchorNode, anchorOffset, focusNode, focusOffset;
  let position = 0;

  visitNodes(parent, n => {
    if (n.nodeType == Node.TEXT_NODE) {
      const length = n.length;

      if (position + length > start && anchorNode == null) {
        anchorNode = n;
        anchorOffset = start - position;
      }

      if (position + length > end && focusNode == null) {
        focusNode = n;
        focusOffset = end - position;
      }

      position += length;
    }
  });

  if (anchorNode == null) {
    anchorNode = parent;
    anchorOffset = parent.childNodes.length;
  }

  if (focusNode == null) {
    focusNode = parent;
    focusOffset = parent.childNodes.length;
  }

  const selection = window.getSelection();
  selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
}