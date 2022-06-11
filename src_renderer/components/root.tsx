import { useModel, useObservable } from 'kyoka';
import * as React from 'react'
import AppModel from '../app-model';
import Editor from './editor';
import Library from './library';
import ToolBar from './tool-bar';

export default function Root() {
  return (
    <>
      <div id="side-pane">
        <Library></Library>
      </div>
      <div id="main-pane">
        <ToolBar />
        <Editor />
      </div>
    </>
  );
};