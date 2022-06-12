import * as React from 'react'
import { useModel, useObservable } from "kyoka";
import AppModel from "../app-model";
import EditableHeading from './editable-heading';
import EditorBody from './editor-body';

export default function Editor() {
  const model = useModel<AppModel>();
  const note = useObservable(model.note);
  const element = useObservable(model.element);
  const title = note?.head?.title ?? '';

  return (
    <div id="editor">
      {note != null ? <>
        <EditableHeading placeholder="Title" onInput={(h) => model.onChangeTitle(h)} html={title}></EditableHeading>
        <div>{note?.head?.createdAt?.toString()}</div>
        <EditorBody element={element} />
      </> : null}
    </div>
  );
}