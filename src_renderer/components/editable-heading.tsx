import * as React from 'react'
import { CursorRange, getCursorRange, setCursorRange } from '../cursor';

export interface EditableProps {
  html?: string;
  onInput?: (html: string) => void;
  component: React.FC<any>;
  placeholder?: string;
}

export default function Editable(props: EditableProps) {
  const element = React.useRef<HTMLHeadingElement>(null);
  const compositing = React.useRef(false);
  const range = React.useRef<CursorRange>();
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (range.current != null) {
      setCursorRange(element.current!, range.current);
    }
  }, [props.html]);

  const onInput = React.useCallback((e) => {
    if (!compositing.current) {
      console.log(e)
      range.current = getCursorRange(element.current!);
      if (props.onInput != null) {
        props.onInput(e.target.innerHTML);
      }
    }
  }, [props.onInput]);

  const showPlaceholder = props.placeholder != null && (props.html == null || (!focused && props.html.length == 0));

  return (
    <props.component
      className={showPlaceholder ? 'placeholder' : ''}
      ref={element}
      contentEditable
      onFocus={e => setFocused(true)}
      onBlur={e => setFocused(false)}
      onKeyDown={e => {
        if (!compositing.current && e.key == 'Enter') {
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
      dangerouslySetInnerHTML={{ __html: showPlaceholder ? props.placeholder : props.html }}>
    </props.component>
  );
}

const H1 = React.forwardRef((props, ref: React.Ref<HTMLHeadingElement>) => (
  <h1 ref={ref} {...props} />
));

export function EditableH1(props: any) {
  return <Editable component={H1} {...props}></Editable>
}

const P = React.forwardRef((props, ref: React.Ref<HTMLParagraphElement>) => (
  <p ref={ref} {...props} />
));

export function EditableParagraph(props: any) {
  return <Editable component={P} {...props}></Editable>
}