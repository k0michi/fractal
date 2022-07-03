import EditorModel from "../editor-model";
import ElementType from "../element-type";
import { removeChildNodes } from "../utils";
import * as Editable from './editable';
import * as EditableMath from './editable-math';
import * as EditableCode from './editable-code';

export default class EditorView {
  model: EditorModel | null;
  $editor: HTMLDivElement;
  $editorHead: HTMLDivElement;
  $editorBody: HTMLDivElement;

  constructor(model: EditorModel | null, $editor: HTMLDivElement) {
    this.model = model;
    model?.registerView(this);
    this.$editor = $editor;
  }

  render() {
    if (this.model?.note == null) {
      return;
    }

    removeChildNodes(this.$editor);
    this.renderHead();

    const $hr = document.createElement('hr');
    this.$editor.appendChild($hr);

    this.renderBody();
  }

  renderHead() {
    const $editorHead = document.createElement('div');
    $editorHead.id = 'editor-head';

    {
      const $title = Editable.buildEditable('h1', this.model?.note.head.title, 'Title');

      $title.addEventListener('editableinput', e => {
        const target = e.target as HTMLHeadingElement;
        this.model?.onChangeTitle(target.textContent!);
        console.log(e)
      });

      $editorHead.appendChild($title);
    }
    {
      const $date = document.createElement('div');
      $date.append(this.model?.note.head.createdAt?.toString());
      $editorHead.appendChild($date);
    }

    this.$editor.appendChild($editorHead);
    this.$editorHead = $editorHead;
  }

  renderBody() {
    const $editorBody = document.createElement('div');
    $editorBody.id = 'editor-body';

    $editorBody.addEventListener('mousedown', e => {
      if (e.target == $editorBody) {
        const target = $editorBody.lastChild;

        if (target != null) {
          (target as any).focus();
          window.getSelection()?.selectAllChildren(target);
          window.getSelection()?.collapseToEnd();
          e.preventDefault();
        }
      }
    });

    {
      if (this.model?.note.body.childNodes != null) {
        const $body = this.transformNode(this.model?.note.body.childNodes);
        $editorBody.appendChild($body);
      }
    }

    this.$editor.appendChild($editorBody);
    this.$editorBody = $editorBody;
  }

  static newEditEvent() {
    return new CustomEvent('edit');
  }

  registerEditableEvent(element: HTMLElement) {
    element.addEventListener('edit', e => {
      const element = (e.target! as HTMLElement);
      const id = element.dataset.id!;
      this.model?.onEditElement(id, element);
    });
  }

  createBodyEditable(type: string, attributes: NamedNodeMap, content: DocumentFragment) {
    switch (type) {
      case ElementType.Paragraph:
        const p = Editable.buildEditable('p', content);
        p.dataset.id = attributes['id'].value;
        this.registerEditableEvent(p);

        p.addEventListener('keydown', e => {
          if (e.key == 'Tab') {
            this.model?.increaseIndent(p.dataset.id!);
          }
        });

        return p;
      case ElementType.Heading1:
      case ElementType.Heading2:
      case ElementType.Heading3:
      case ElementType.Heading4:
      case ElementType.Heading5:
      case ElementType.Heading6:
        const h = Editable.buildEditable(type, content, 'Heading ' + type.charAt(1));
        h.dataset.id = attributes['id'].value;
        this.registerEditableEvent(h);
        return h;
      case ElementType.Math:
        const math = EditableMath.buildMathBlock(content.textContent ?? '');
        math.dataset.id = attributes['id'].value;
        this.registerEditableEvent(math);
        return math;
      case ElementType.Bold:
        const b = document.createElement('b');
        b.appendChild(content);
        return b;
      case ElementType.Underline:
        const u = document.createElement('u');
        u.appendChild(content);
        return u;
      case ElementType.Italic:
        const i = document.createElement('i');
        i.appendChild(content);
        return i;
      case ElementType.Strikethrough:
        const s = document.createElement('s');
        s.appendChild(content);
        return s;
      case ElementType.Code:
        const code = EditableCode.buildCodeBlock(content.textContent ?? '', attributes['lang']?.value);
        code.dataset.id = attributes['id'].value;
        this.registerEditableEvent(code);
        return code;
      case ElementType.Indent:
        const indent = document.createElement('div');
        indent.className = 'indent';
        indent.appendChild(content);
        return indent;
    }

    throw new Error('Unsupported element');
  }

  transformNode(node: Node | NodeList) {
    if (node instanceof NodeList) {
      const fragment = document.createDocumentFragment();

      for (const child of node) {
        fragment.appendChild(this.transformNode(child));
      }

      return fragment;
    } else {
      if (node.nodeType == Node.ELEMENT_NODE) {
        const element = node as Element;
        const fragment = document.createDocumentFragment();

        for (const child of element.childNodes) {
          fragment.appendChild(this.transformNode(child));
        }

        const transformed = this.createBodyEditable(element.tagName, element.attributes, fragment);
        return transformed;
      } else if (node.nodeType == Node.TEXT_NODE) {
        const text = node as Text;
        let data = text.data;
        data = data.trim();

        return document.createTextNode(data);
      }
    }

    throw new Error('Unsupported node');
  }

  appendChild(element: Element) {
    const transformed = this.transformNode(element);
    this.$editorBody.appendChild(transformed);
  }

  getBlock(id: string) {
    return this.$editorBody.querySelector(`[data-id="${id}"]`);
  }
}