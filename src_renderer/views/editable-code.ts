import * as Prism from 'prismjs';
import * as Editable from './editable';
import { getCursorRange, setCursorRange } from '../cursor';

const languages = [
  { name: 'Plain Text', value: 'none' },
  { name: 'JavaScript', value: 'js' },
  { name: 'CSS', value: 'css' },
  { name: 'HTML', value: 'html' },
];

export function buildCodeBlock(content: string, lang: string = 'none') {
  const $codeBlock = document.createElement('pre');
  setLanguage($codeBlock, lang);

  const $select = document.createElement('select');

  for (const language of languages) {
    const $option = document.createElement('option');
    $option.value = language.value;
    $option.text = language.name;
    $select.appendChild($option);
  }

  $select.value = lang;

  $select.addEventListener('change', e => {
    setLanguage($codeBlock, $select.value);
    setLanguage($editable, $select.value);
    highlight($editable);
    $codeBlock.dispatchEvent(Editable.newEditEvent());
  })

  $codeBlock.appendChild($select);


  const $editable = Editable.buildEditable('code', content);
  setLanguage($editable, lang);
  highlight($editable);

  $editable.addEventListener('edit', e => {
    highlight($editable);
    $codeBlock.dispatchEvent(Editable.newEditEvent());
  });

  $codeBlock.appendChild($editable);

  return $codeBlock;
}

function setLanguage(element: HTMLElement, lang: string) {
  element.className = `language-${lang}`;
}

function highlight(element: Element) {
  const range = getCursorRange(element);
  // FIXME: Issue when range = {start: 0, end: 0}
  Prism.highlightElement(element, false);
  setCursorRange(element, range);
}