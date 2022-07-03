import Katex from 'katex';
import * as Editable from './editable';
import { removeChildNodes } from '../utils';

export function buildMathBlock(content: string) {
  const $mathBlock = document.createElement('div');
  $mathBlock.className = 'math-block';

  const $editable = Editable.buildEditable('pre', content);
  const $display = document.createElement('div');
  $mathBlock.appendChild($display);
  Katex.render(content, $display, { displayMode: true });

  $mathBlock.addEventListener('click', e => {
    if ($mathBlock.contains($display)){
      removeChildNodes($mathBlock);
      $mathBlock.appendChild($editable);
      $editable.focus();
    }
  });

  $editable.addEventListener('blur', e => {
    removeChildNodes($mathBlock);
    $mathBlock.appendChild($display);
    Katex.render($editable.textContent!, $display, { displayMode: true });
  });
 
  $editable.addEventListener('edit', e => {
    $mathBlock.dispatchEvent(Editable.newEditEvent());
  });

  return $mathBlock;
}