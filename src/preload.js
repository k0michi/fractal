import { ipcRenderer, contextBridge } from 'electron';

export class Bridge {
  openFile = async (...args) => {
    return await ipcRenderer.invoke('open-file', ...args);
  }

  readFile = async (...args) => {
    return await ipcRenderer.invoke('read-file', ...args);
  }

  readBinaryFile = async (...args) => {
    return await ipcRenderer.invoke('read-binary-file', ...args);
  }

  writeFile = async (...args) => {
    return await ipcRenderer.invoke('write-file', ...args);
  }

  writeBinaryFile = async (...args) => {
    return await ipcRenderer.invoke('write-binary-file', ...args);
  }

  readDir = async (...args) => {
    return await ipcRenderer.invoke('read-dir', ...args);
  }

  readDirRecursive = async (...args) => {
    return await ipcRenderer.invoke('read-dir-recursive', ...args);
  }

  makeDir = async (...args) => {
    return await ipcRenderer.invoke('make-dir', ...args);
  }

  getPath = async (...args) => {
    return await ipcRenderer.invoke('get-path', ...args);
  }

  doesExist = async (...args) => {
    return await ipcRenderer.invoke('does-exist', ...args);
  }

  saveFileDialog = async (...args) => {
    return await ipcRenderer.invoke('save-file-dialog', ...args);
  }

  fetch = async (...args) => {
    return await ipcRenderer.invoke('fetch', ...args);
  }
}

contextBridge.exposeInMainWorld('bridge', new Bridge());