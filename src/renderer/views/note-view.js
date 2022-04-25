import Katex from 'katex';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';

import * as utils from '../utils';
import * as symbols from '../symbols';
import { changeTitle, createListItem, createParagraph, focus, focusListItem, insertBlock, insertListItem, removeBlock, removeListItem, setFocusIndex } from '../main';

export default class NoteView {
  constructor() {
    this.$note = document.createElement('div');
    this.$note.id = 'note';
    this.$noteContent = document.createElement('div');
    this.$noteContent.id = 'note-content';
    this.$note.append(this.$noteContent);
    this.$nodeBody = document.createElement('div');
    this.$nodeBody.id = 'note-body';
    this.$noteContent.append(this.$nodeBody);
  }

  insertElement(element, beforeIndex) {
    const node = this.buildNode(element);
    this.$nodeBody.insertBefore(node, this.$nodeBody.childNodes[beforeIndex]);
  }

  insertListItem(element, indexOfList, index) {
    const node = this.buildNode(element);
    this.$nodeBody.childNodes[indexOfList].insertBefore(node, this.$nodeBody.childNodes[indexOfList].childNodes[index]);
  }

  remove(index) {
    this.$nodeBody.childNodes[index]?.remove();
  }

  removeListItem(indexOfList, index) {
    this.$nodeBody.childNodes[indexOfList]?.childNodes[index]?.remove();
  }

  focus(index) {
    this.$nodeBody.childNodes[index]?.focus();
  }

  focusListItem(indexOfList, index) {
    this.$nodeBody.childNodes[indexOfList]?.childNodes[index]?.focus();
  }

  render(note) {
    utils.removeChildNodes(this.$noteContent);
    utils.removeChildNodes(this.$nodeBody);

    const $h1 = document.createElement('h1');
    $h1.id = 'title';
    $h1.textContent = note.head.properties.title;
    $h1.contentEditable = true;

    $h1.addEventListener('input', e => {
      changeTitle($h1.textContent);
    });

    this.$noteContent.append($h1);

    const $table = document.createElement('table');
    $table.className = 'property-table';

    for (let [key, value] of Object.entries(note.head.properties)) {
      const $tr = document.createElement('tr');
      const $td1 = document.createElement('td');
      $td1.textContent = key;
      $tr.append($td1);
      const $td2 = document.createElement('td');

      if (key == 'created' || key == 'modified') {
        value = new Date(value).toLocaleString();
      }

      $td2.textContent = value;
      $tr.append($td2);
      $table.append($tr);
    }

    this.$noteContent.append($table);

    this.$noteContent.append(this.$nodeBody);

    for (const e of note.body.children) {
      const node = this.buildNode(e);
      this.$nodeBody.append(node);
    }
  }

  buildNode(element) {
    switch (element.type) {
      case symbols.PARAGRAPH:
        return buildParagraph(element);
      case symbols.MATH:
        return buildMath(element);
      case symbols.HEADER1:
      case symbols.HEADER2:
      case symbols.HEADER3:
      case symbols.HEADER4:
      case symbols.HEADER5:
      case symbols.HEADER6:
        return buildHeader(element);
      case symbols.HORIZONTAL_RULE:
        return buildHorizontalRule(element);
      case symbols.BLOCKQUOTE:
        return buildBlockquote(element);
      case symbols.CODE:
        return buildCode(element);
      case symbols.LIST_ITEM:
        return buildListItem(element);
      case symbols.ORDERED_LIST:
        return buildOrderedList(element);
      case symbols.UNORDERED_LIST:
        return buildUnorderedList(element);
    }
  }
}

let isComposing = false;

window.addEventListener('compositionstart', e => {
  isComposing = true;
});

window.addEventListener('compositionend', e => {
  isComposing = false;
});

function buildParagraph(paragraph) {
  const $paragraph = document.createElement('p');
  $paragraph.dataset.type = symbols.PARAGRAPH;
  $paragraph.dataset.id = paragraph.id;
  $paragraph.style = 'overflow-wrap: anywhere; width: 100%;';
  $paragraph.contentEditable = true;
  $paragraph.textContent = paragraph.content;

  $paragraph.addEventListener('keydown', e => {
    const index = utils.nodeIndexOf($paragraph, $paragraph.parentNode.childNodes);
    setFocusIndex(index);

    const selection = window.getSelection();
    const selectionRange = utils.getCursorRange($paragraph);

    if (e.key == 'Enter' && !isComposing) {
      const nextParagraph = createParagraph();
      insertBlock(index + 1, nextParagraph);
      focus(index + 1);
      e.preventDefault();
    }

    if (e.key == 'Backspace' && selection.isCollapsed && selectionRange.start == 0) {
      removeBlock(index);
      focus(index - 1);
      e.preventDefault();
    }

    if (e.key == 'ArrowUp' && selection.isCollapsed && selectionRange.start == 0) {
      focus(index - 1);
    }

    if (e.key == 'ArrowDown' && selection.isCollapsed && selectionRange.start == $paragraph.textContent.length) {
      focus(index + 1);
    }
  });

  $paragraph.addEventListener('input', e => {
    paragraph.content = $paragraph.textContent;
    paragraph.modified = Date.now();
  });

  $paragraph.addEventListener('focus', e => {
    const index = utils.nodeIndexOf($paragraph, $paragraph.parentNode.childNodes);
    setFocusIndex(index);
  });

  $paragraph.addEventListener('paste', e => {
    const paste = (e.clipboardData ?? window.clipboardData).getData('text');
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      selection.collapseToEnd();
      $paragraph.normalize();
      paragraph.content = $paragraph.textContent;
      paragraph.modified = Date.now();
    }

    e.preventDefault();
  });

  return $paragraph;
}

export function buildMath(math) {
  const $container = document.createElement('div');
  $container.dataset.type = symbols.MATH;
  $container.dataset.id = math.id;
  $container.className = 'math';
  const $editor = document.createElement('pre');
  $editor.style = 'overflow-wrap: anywhere; width: 100%;';
  $editor.contentEditable = true;

  $editor.textContent = math.content;
  Katex.render(math.content, $container, { displayMode: true });

  window.addEventListener('click', e => {
    if ($container.contains(e.target) && ($container.firstChild == null || $container.firstChild != $editor)) {
      if ($container.firstChild != null) {
        $container.removeChild($container.firstChild);
      }

      $container.append($editor);
      $editor.focus();
    } else if (!$container.contains(e.target) && ($container.firstChild == null || !$container.firstChild.classList.contains('katex-display'))) {
      if ($container.firstChild != null) {
        $container.removeChild($container.firstChild);
      }

      Katex.render(math.content, $container, { displayMode: true });
    }
  });

  $editor.addEventListener('input', e => {
    math.content = $editor.textContent;
    math.modified = Date.now();
  });

  $editor.addEventListener('focus', e => {
    const index = utils.nodeIndexOf($container, $container.parentNode.childNodes);
    setFocusIndex(index);
  });

  return $container;
}

function buildHeader(header) {
  const $header = document.createElement(header.type);
  $header.dataset.type = symbols.headers;
  $header.dataset.id = header.id;
  $header.textContent = header.content;
  $header.style = 'overflow-wrap: anywhere; width: 100%;';
  $header.contentEditable = true;

  $header.addEventListener('input', e => {
    header.content = $header.textContent;
    header.modified = Date.now();
  });

  $header.addEventListener('focus', e => {
    const index = utils.nodeIndexOf($header, $header.parentNode.childNodes);
    setFocusIndex(index);
  });

  return $header;
}

function buildHorizontalRule(rule) {
  const $hr = document.createElement('hr');
  $hr.dataset.type = symbols.HORIZONTAL_RULE;
  $hr.dataset.id = rule.id;
  return $hr;
}

function buildBlockquote(blockquote) {
  const $blockquote = document.createElement('blockquote');
  $blockquote.dataset.type = symbols.BLOCKQUOTE;
  $blockquote.dataset.id = blockquote.id;
  $blockquote.textContent = blockquote.content;
  $blockquote.style = 'overflow-wrap: anywhere; width: 100%;';
  $blockquote.contentEditable = true;

  $blockquote.addEventListener('input', e => {
    blockquote.content = $blockquote.textContent;
    blockquote.modified = Date.now();
  });

  $blockquote.addEventListener('focus', e => {
    const index = utils.nodeIndexOf($blockquote, $blockquote.parentNode.childNodes);
    setFocusIndex(index);
  });

  return $blockquote;
}

function buildLanguageSelect(selected) {
  const $select = document.createElement('select');
  $select.style = 'display: block;';
  $select.name = 'language';

  for (let language of symbols.languages) {
    const $option = document.createElement('option');
    $option.value = language.id;
    $option.text = language.name;
    $select.append($option);
  }

  $select.value = selected;
  return $select;
}

function setLanguage(language, $pre, $code) {
  $code.className = `language-${language}`;
  $pre.className = `language-${language}`;
}

function buildCode(code) {
  const $pre = document.createElement('pre');
  $pre.dataset.type = symbols.CODE;
  $pre.dataset.id = code.id;
  const $langSelect = buildLanguageSelect(code.language);
  const $code = document.createElement('code');
  $code.style = 'display: inline-block; width: 100%;';
  $pre.append($langSelect);
  $pre.append($code);
  $code.textContent = code.content;
  $code.contentEditable = true;

  if (code.language != null) {
    setLanguage(code.language, $pre, $code);
  }

  Prism.highlightElement($code, false);

  $code.addEventListener('keydown', e => {
    const selection = window.getSelection();

    if (e.key == 'Tab') {
      e.preventDefault();
      selection.getRangeAt(0).insertNode(document.createTextNode('  '));
      selection.collapseToEnd();
      $code.normalize();
      const range = utils.getCursorRange($code, selection);
      Prism.highlightElement($code, false);
      utils.setCursorRange($code, range);
      code.content = $code.textContent;
      code.modified = Date.now();
    }
  });

  $code.addEventListener('input', e => {
    code.content = $code.textContent;
    code.modified = Date.now();

    if (!isComposing) {
      // Work around for the problem that the cursor goes to the beginning after highlighting
      const range = utils.getCursorRange($code);
      Prism.highlightElement($code, false);
      utils.setCursorRange($code, range);
    }
  });

  $langSelect.addEventListener('change', e => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage, $pre, $code);
    Prism.highlightElement($code, false);
    code.language = newLanguage;
  });

  $pre.addEventListener('focus', e => {
    const index = utils.nodeIndexOf($pre, $pre.parentNode.childNodes);
    setFocusIndex(index);
  });

  $code.addEventListener('paste', e => {
    const paste = (e.clipboardData ?? window.clipboardData).getData('text');
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      selection.collapseToEnd();
      $code.normalize();
      const range = utils.getCursorRange($code, selection);
      Prism.highlightElement($code, false);
      utils.setCursorRange($code, range);
      code.content = $code.textContent;
      code.modified = Date.now();
    }

    e.preventDefault();
  });

  return $pre;
}

function buildListItem(listItem) {
  const $li = document.createElement('li');
  $li.dataset.type = symbols.LIST_ITEM;
  $li.dataset.id = listItem.id;
  $li.textContent = listItem.content;
  $li.style = 'overflow-wrap: anywhere; width: 100%;';
  $li.contentEditable = true;

  $li.addEventListener('keydown', e => {
    const index = utils.nodeIndexOf($li, $li.parentNode.childNodes);
    const $list = e.target.parentNode;
    const indexOfList = utils.nodeIndexOf($list, $list.parentNode.childNodes);
    //setFocusIndex(index);

    const selection = window.getSelection();
    const selectionRange = utils.getCursorRange($li);

    if (e.key == 'Enter' && !isComposing) {
      const nextItem = createListItem();
      insertListItem(indexOfList, index + 1, nextItem);
      focusListItem(indexOfList, index + 1);
      e.preventDefault();
    }

    if (e.key == 'Backspace' && selection.isCollapsed && selectionRange.start == 0) {
      removeListItem(indexOfList, index);
      focusListItem(indexOfList, index - 1);
      e.preventDefault();
    }

    if (e.key == 'Tab') {
      // TODO: Support indentation
    }
  });

  $li.addEventListener('input', e => {
    listItem.content = $li.textContent;
    listItem.modified = Date.now();
  });

  $li.addEventListener('focus', e => {
    const $list = e.target.parentNode;
    const indexOfList = utils.nodeIndexOf($list, $list.parentNode.childNodes);
    setFocusIndex(indexOfList);
  });

  return $li;
}

function buildOrderedList(list) {
  const $ol = document.createElement('ol');
  $ol.dataset.type = symbols.ORDERED_LIST;
  $ol.dataset.id = list.id;
  $ol.style = 'overflow-wrap: anywhere; width: 100%;';

  for (const item of list.content) {
    $ol.append(buildListItem(item));
  }

  return $ol;
}

function buildUnorderedList(list) {
  const $ul = document.createElement('ul');
  $ul.dataset.type = symbols.UNORDERED_LIST;
  $ul.dataset.id = list.id;
  $ul.style = 'overflow-wrap: anywhere; width: 100%;';

  for (const item of list.content) {
    $ul.append(buildListItem(item));
  }

  return $ul;
}