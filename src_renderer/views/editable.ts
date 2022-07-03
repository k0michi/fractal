
export function buildEditable<K extends keyof HTMLElementTagNameMap>(element: K, content: DocumentFragment | string | null, placeholder: string = '') {
  const $editable = document.createElement<K>(element);
  $editable.contentEditable = 'true';
  const showPlaceholder = content == null || content == '' || (content instanceof DocumentFragment && content.childNodes.length == 0);

  if (showPlaceholder) {
    $editable.textContent = placeholder;
    $editable.classList.add('placeholder');
  } else {
    if (content instanceof DocumentFragment) {
      $editable.appendChild(content);
    } else {
      $editable.textContent = content;
    }
  }

  $editable.addEventListener('focus', e => {
    if ($editable.classList.contains('placeholder')) {
      $editable.classList.remove('placeholder');
      $editable.textContent = '';
    }
  });

  $editable.addEventListener('blur', e => {
    if (!$editable.classList.contains('placeholder') && $editable.textContent == '') {
      $editable.textContent = placeholder;
      $editable.classList.add('placeholder');
    }
  });

  $editable.addEventListener('paste', e => {
    const ce = e as ClipboardEvent;
    const paste = ce.clipboardData!.getData('text');
    const selection = window.getSelection();

    if (selection != null && selection.rangeCount > 0) {
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      selection.collapseToEnd();
      $editable.dispatchEvent(newEditEvent());
    }

    e.preventDefault();
  });

  $editable.addEventListener('drop', e => {
    e.preventDefault();
  });

  $editable.addEventListener('input', e => {
    $editable.dispatchEvent(newEditEvent());
  });

  $editable.addEventListener('beforeinput', e => {
    const ie = e as InputEvent;

    if (ie.inputType == 'insertParagraph') {
      e.preventDefault();
    }
  });

  $editable.addEventListener('compositionend', e => {
    $editable.dispatchEvent(newEditEvent());
  });

  return $editable;
}

export function newEditEvent() {
  return new CustomEvent('edit');
}