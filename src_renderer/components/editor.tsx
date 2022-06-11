import * as React from 'react'
import { useModel, useObservable } from "kyoka";
import AppModel from "../app-model";

export default function Editor() {
  const model = useModel<AppModel>();
  const note = useObservable(model.note);
  const element = useObservable(model.element);
  const placeholder = note?.head?.title.length == 0;
  const title = placeholder?'Title':note?.head?.title;

  return (
    <div id="editor">
      <h1 className={placeholder?'placeholder':''}>{title}</h1>
      <div>{note?.head?.createdAt}</div>
      {element}
    </div>
  );
}