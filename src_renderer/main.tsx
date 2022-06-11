import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import AppModel from './app-model.js';
import Root from './components/root.jsx';
import 'modern-normalize/modern-normalize.css';
import "./styles.css";
import { ModelProvider } from 'kyoka';

const model = new AppModel();
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <ModelProvider model={model}>
    <Root></Root>
  </ModelProvider>
);