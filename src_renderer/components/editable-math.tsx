import * as React from 'react'
import { CursorRange, getCursorRange, setCursorRange } from '../cursor';
import { EditableParagraph, EditablePre, EditableRef } from './editable';
import Katex from './katex';

export interface EditableMathProps {
  children?: string;
  onInput?: (e: any) => void;
}

export function EditableMath(props: EditableMathProps) {
  const container = React.useRef<HTMLDivElement>(null);
  const editable = React.useRef<EditableRef>(null);
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (focused) {
      editable.current?.focus();
    }
  }, [focused]);

  return (
    <div
      className='math'
      ref={container}
      onClick={e => {
        setFocused(true);
      }}
      onBlur={e => {
        setFocused(false);
      }}
    >
      {
        focused ?
          <EditablePre ref={editable} onInput={e => {
            if (props.onInput != null) {
              props.onInput(e);
            }
          }}>{props.children}</EditablePre> :
          <Katex>{props.children}</Katex>
      }
    </div>
  );
}