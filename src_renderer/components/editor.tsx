import * as React from 'react'
import { useModel, useObservable } from "kyoka";
import AppModel from "../app-model";
import EditorView from '../views/editor-view';

export default function Editor() {
  const model = useModel<AppModel>();
  const editor = useObservable(model.activeEditor);
  const note = editor?.note;
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const editorView = new EditorView(editor, editorRef.current!);
    editorView.render();
  }, [note]);

  return (
    <div id="editor" ref={editorRef} />
  );
}