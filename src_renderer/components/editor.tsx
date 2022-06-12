import * as React from 'react'
import { useModel, useObservable } from "kyoka";
import AppModel from "../app-model";
import { EditableH1, EditableParagraph } from './editable-heading';
import EditorBody from './editor-body';
import { toElement } from '../miml-react';
import { Note } from '../library';
import { transformHL } from '../miml';

export default function Editor() {
  const model = useModel<AppModel>();
  const note = useObservable(model.note);
  const title = note?.head?.title ?? '';

  return (
    <div id="editor">
      {note != null ? <>
        <EditableH1 placeholder="Title" onInput={(h) => model.onChangeTitle(h)} html={title}></EditableH1>
        <div>{note?.head?.createdAt?.toString()}</div>
        <EditorBody element={processBody(model, note)} />
      </> : null}
    </div>
  );
}

function processBody(model: AppModel, note: Note) {
  const cloned = note!.body.cloneNode(true);
  transformHL(cloned as Element);

  const element = toElement(cloned.childNodes, (type: any, props: any, ...children) => {
    if (type == 'p') {
      props.onInput = (h) => {
        const id = props.id;
        model.onChange(id, h);
      }

      props.html = children.join();
      return React.createElement(EditableParagraph, props);
    }

    return React.createElement(type, props, ...children);
  });

  return element as React.ReactElement;
}