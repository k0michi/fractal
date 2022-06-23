import * as React from 'react'
import { EditableParagraph, EditablePre, EditableCodeElem, EditableRef } from './editable';

import 'prismjs/themes/prism.css';

export interface EditableCodeProps {
  children?: string;
  lang: string;
  onInput?: (e: any) => void;
  onChangeLang?: (lang: string) => void;
}

export function EditableCode(props: EditableCodeProps) {
  const editable = React.useRef<EditableRef>(null);

  return (
    <pre className={`language-${props.lang}`}>
      <select value={props.lang} onChange={(e)=>{
        if(props.onChangeLang != null) {
          props.onChangeLang(e.target.value);
        }
      }}>
        <option value="">PlainText</option>
        <option value="js">JavaScript</option>
        <option value="css">CSS</option>
        <option value="html">HTML</option>
      </select>
      <EditableCodeElem language={props.lang} highlight={true} ref={editable} onInput={props.onInput}>{props.children}</EditableCodeElem>
    </pre>
  );
}