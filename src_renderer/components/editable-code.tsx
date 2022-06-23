import * as React from 'react'
import { CursorRange, getCursorRange, setCursorRange } from '../cursor';
import { EditableParagraph, EditablePre, EditablePreCode, EditableRef } from './editable';
import Katex from './katex';

import 'prismjs/themes/prism.css';

export interface EditableCodeProps {
  children?: string;
  onInput?: (tex: string) => void;
}

export function EditableCode(props: EditableCodeProps) {
  const editable = React.useRef<EditableRef>(null);

  return (
    <EditablePreCode language="js" highlight={true} ref={editable} onInput={ props.onInput}>{props.children}</EditablePreCode>
  );
}