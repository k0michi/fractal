import * as React from 'react'
import { useModel, useObservable } from "kyoka";
import AppModel from "../app-model";
import ElementType from '../element-type';

export default function ToolBar() {
  const model = useModel<AppModel>();

  return (
    <div id="tool-bar">
      <button onClick={model.onClickOpen}>Open</button>
      <button onClick={model.library.onClickNew}>New</button>
      <button onClick={model.onClickSave}>Save</button>
      <div>
        <button onClick={e => model.onClickAdd(ElementType.Heading1)}>H1</button>
        <button onClick={e => model.onClickAdd(ElementType.Heading2)}>H2</button>
        <button onClick={e => model.onClickAdd(ElementType.Heading3)}>H3</button>
        <button onClick={e => model.onClickAdd(ElementType.Heading4)}>H4</button>
        <button onClick={e => model.onClickAdd(ElementType.Heading5)}>H5</button>
        <button onClick={e => model.onClickAdd(ElementType.Heading6)}>H6</button>
        <button onClick={e => model.onClickAdd(ElementType.Math)}>Math</button>
        <button onClick={e => model.onClickTextStyle(ElementType.Bold)}>B</button>
        <button onClick={e => model.onClickTextStyle(ElementType.Italic)}>I</button>
        <button onClick={e => model.onClickTextStyle(ElementType.Underline)}>U</button>
        <button onClick={e => model.onClickTextStyle(ElementType.Strikethrough)}>S</button>
      </div>
    </div>
  );
}