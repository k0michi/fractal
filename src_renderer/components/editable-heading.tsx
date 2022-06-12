import * as React from 'react'
import { CursorRange, getCursorRange, setCursorRange } from '../cursor';

export default function EditableHeading(props: any) {
  const element = React.useRef<HTMLHeadingElement>(null);
  const compositing = React.useRef(false);
  const range = React.useRef<CursorRange>();
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (range.current != null) {
      setCursorRange(element.current!, range.current);
    }
  }, [props.html]);

  const onInput = (e) => {
    if (!compositing.current) {
      range.current = getCursorRange(element.current!);
      console.log(range.current)
      props.onInput(e.target.innerHTML);
    }
  }

  const doUsePlaceholder = !focused && props.html.length == 0;

  return (
    <h1
      className={doUsePlaceholder ? 'placeholder' : ''}
      ref={element}
      contentEditable
      onFocus={e => setFocused(true)}
      onBlur={e => setFocused(false)}
      onKeyDown={e => {
        if (e.key == 'Enter') {
          (e.target as HTMLHeadingElement).blur()
        }
      }}
      onInput={onInput}
      onCompositionStart={e => compositing.current = true}
      onCompositionEnd={e => {
        compositing.current = false;
        onInput(e);
      }}
      onPaste={e => {
        const paste = e.clipboardData.getData('text');
        const selection = window.getSelection();

        if (selection != null && selection.rangeCount > 0) {
          selection.deleteFromDocument();
          selection.getRangeAt(0).insertNode(document.createTextNode(paste));
          selection.collapseToEnd();
          onInput(e);
        }

        e.preventDefault();
      }}
      onDrop={e => {
        e.preventDefault();
      }}
      dangerouslySetInnerHTML={{ __html: doUsePlaceholder ? props.placeholder : props.html }}>
    </h1>
  );
}