import { nanoid } from 'nanoid';
import * as symbols from './symbols';

export function createParagraph(content = '') {
  const id = nanoid();

  const paragraph = {
    type: symbols.PARAGRAPH,
    content,
    id
  };

  return paragraph;
}

export function createMath(content = '') {
  const id = nanoid();

  const math = {
    type: symbols.MATH,
    content,
    id
  };

  return math;
}

export function createHeader(level, content = '') {
  const type = symbols.headers[level - 1];

  const id = nanoid();

  const header = {
    type,
    content,
    id
  };

  return header;
}

export function createHorizontalRule() {
  const id = nanoid();

  const horizontal = {
    type: symbols.HORIZONTAL_RULE,
    id
  };

  return horizontal;
}

export function createBlockquote(content = '') {
  const id = nanoid();

  const blockquote = {
    type: symbols.BLOCKQUOTE,
    content,
    id
  };

  return blockquote;
}

export function createCode(content = '', language = 'javascript') {
  const id = nanoid();

  const code = {
    type: symbols.CODE,
    content,
    language,
    id
  };

  return code;
}

export function createListItem(content = '') {
  const id = nanoid();

  const code = {
    type: symbols.LIST_ITEM,
    content,
    id
  };

  return code;
}

export function createOrderedList(content = [createListItem()]) {
  const id = nanoid();

  const code = {
    type: symbols.ORDERED_LIST,
    content,
    id
  };

  return code;
}

export function createUnorderedList(content = [createListItem()]) {
  const id = nanoid();

  const code = {
    type: symbols.UNORDERED_LIST,
    content,
    id
  };

  return code;
}

export function createImage(filename) {
  const id = nanoid();

  const image = {
    type: symbols.IMAGE,
    filename,
    id
  };

  return image;
}