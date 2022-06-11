import * as React from 'react'
import { useModel, useObservable } from "kyoka";
import AppModel from "../app-model";
import EditableHeading from './editable-heading';

export default function Editor() {
  const editor = React.useRef<HTMLDivElement>(null);
  const model = useModel<AppModel>();
  const note = useObservable(model.note);
  const element = useObservable(model.element);
  const title = note?.head?.title ?? '';

  return (
    <div ref={editor} id="editor" onClick={e => {
      if (e.target == editor.current) {
        (editor.current?.lastChild! as any)?.focus();
      }
    }}>
      {note != null ? <>
        <EditableHeading placeholder="Title" onInput={(h) => model.onChangeTitle(h)} html={title}></EditableHeading>
        <div>{note?.head?.createdAt?.toString()}</div>
        {element}
      </> : null}
    </div>
  );
}