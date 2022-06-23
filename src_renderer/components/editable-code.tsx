import * as React from 'react'
import { EditableParagraph, EditablePre, EditableCodeElem, EditableRef } from './editable';

import 'prismjs/themes/prism.css';

export interface EditableCodeProps {
  children?: string;
  onInput?: (e: any) => void;
  onChangeLang?: (lang: string) => void;
}

export function EditableCode(props: EditableCodeProps) {
  const editable = React.useRef<EditableRef>(null);
  const [lang, setLang] = React.useState('js');

  return (
    <pre className={`language-${lang}`}>
      <select value={lang} onChange={(e)=>setLang(e.target.value)}>
        <option value="js">JavaScript</option>
        <option value="css">CSS</option>
        <option value="html">HTML</option>
      </select>
      <EditableCodeElem language={lang} highlight={true} ref={editable} onInput={props.onInput}>{props.children}</EditableCodeElem>
    </pre>
  );
}