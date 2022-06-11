import * as React from "react";

export function toElement(node: Node | NodeList): React.ReactElement | string {
  if (node instanceof NodeList) {
    const children: (React.ReactElement | string)[] = [];
    children.length = node.length;

    for (let i = 0; i < node.length; i++) {
      children[i] = toElement(node[i]);
    }

    return React.createElement(React.Fragment, {}, ...children);
  } else {
    if (node.nodeType == Node.DOCUMENT_NODE) {
      return toElement(node.childNodes);
    } else if (node.nodeType == Node.ELEMENT_NODE) {
      const element = node as Element;
      const children: (React.ReactElement | string)[] = [];
      children.length = node.childNodes.length;

      for (let i = 0; i < node.childNodes.length; i++) {
        children[i] = toElement(node.childNodes[i]);
      }

      const props: any = {};

      for (let i = 0; i < element.attributes.length; i++) {
        props[element.attributes[i].name] = element.attributes[i].value;
      }

      const tag = element.tagName.toLowerCase();

      return React.createElement(tag, props, ...children);
    } else if (node.nodeType == Node.TEXT_NODE) {
      const text = node as Text;
      return text.data;
    }
  }

  throw new Error('Unsupported node');
}