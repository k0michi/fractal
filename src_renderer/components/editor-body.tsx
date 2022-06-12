import * as React from 'react'

export interface EditorBodyProps {
  element: React.ReactElement | null
}

export default function EditorBody(props: EditorBodyProps) {
  const editorBody = React.useRef<HTMLDivElement>(null);

  return (
    <div ref={editorBody} id="editor-body" onClick={e => {
      if (e.target == editorBody.current && editorBody.current?.lastChild != null) {
        const target =  editorBody.current?.lastChild as any;
        target.focus();
        window.getSelection()?.selectAllChildren(target);
        window.getSelection()?.collapseToEnd();
      }
    }}>
      {props.element}
    </div>
  );
}