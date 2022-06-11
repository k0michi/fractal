import * as React from 'react'
import { useModel, useObservable } from "kyoka";
import AppModel from "../app-model";

export default function ToolBar() {
  const model = useModel<AppModel>();

  return (
    <div id="tool-bar">
      <button onClick={model.onClickOpen}>Open</button>
      <button onClick={model.library.onClickNew}>New</button>
      <button onClick={model.onClickSave}>Save</button>
    </div>
  );
}