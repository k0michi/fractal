import * as React from 'react'
import { useModel, useObservable } from "kyoka";
import AppModel from "../app-model";
import { EditableH1, EditableH2, EditableH3, EditableH4, EditableH5, EditableH6, EditableParagraph } from './editable';
import EditorBody from './editor-body';
import { toElement } from '../miml-react';
import { Note } from '../library';
import { transformHL } from '../miml';
import { EditableMath } from './editable-math';

export default function Editor() {
  const model = useModel<AppModel>();
  const note = useObservable(model.note);
  const title = note?.head?.title ?? '';

  return (
    <div id="editor">
      {note != null ? <>
        <div id="editor-head">
          <EditableH1 placeholder="Title" onInput={(h) => model.onChangeTitle(h)} html={title}></EditableH1>
          <div>{note?.head?.createdAt?.toString()}</div>
        </div>
        <hr />
        <EditorBody element={processBody(model, note)} />
      </> : null}
    </div>
  );
}

function processBody(model: AppModel, note: Note) {
  const cloned = note!.body.cloneNode(true);
  transformHL(cloned as Element);

  const element = toElement(cloned.childNodes, (type: any, props: any, ...children) => {
    const editable = getEditable(type);

    if (editable != null) {
      if (type == 'math') {
        props.onInput = (t) => {
          const id = props.id;
          model.onChange(id, t);
        }

        return React.createElement(editable, props, ...children);
      }

      props.onInput = (h) => {
        const id = props.id;
        model.onChange(id, h);
      }

      if (type == 'h1' || type == 'h2' || type == 'h3' || type == 'h4' || type == 'h5' || type == 'h6') {
        props.placeholder = `Heading ${type.charAt(1)}`;
      }

      props.html = children.join();
      return React.createElement(editable, props);
    }

    return React.createElement(type, props, ...children);
  });

  return element as React.ReactElement;
}

function getEditable(type: string) {
  if (type == 'p') {
    return EditableParagraph;
  } else if (type == 'h1') {
    return EditableH1;
  } else if (type == 'h2') {
    return EditableH2;
  } else if (type == 'h3') {
    return EditableH3;
  } else if (type == 'h4') {
    return EditableH4;
  } else if (type == 'h5') {
    return EditableH5;
  } else if (type == 'h6') {
    return EditableH6;
  } else if (type == 'math') {
    return EditableMath;
  }
}