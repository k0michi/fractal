import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import AppModel from './app-model.js';
import Root from './components/root.jsx';
import { ModelProvider } from 'kyoka';

import 'modern-normalize/modern-normalize.css';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism.css';
import "./styles.css";

const model = new AppModel();
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <ModelProvider model={model}>
    <Root></Root>
  </ModelProvider>
);