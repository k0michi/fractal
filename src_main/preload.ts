import { ipcRenderer, contextBridge } from 'electron';
import Channel from './channel';

export class Bridge {
  showFileOpenDialog = async (...args: any[]) => {
    return await ipcRenderer.invoke(Channel.showFileOpenDialog, ...args);
  }

  readFileUTF8 = async (...args: any[]) => {
    return await ipcRenderer.invoke(Channel.readFileUTF8, ...args);
  }

  globNodes = async (...args: any[]) => {
    return await ipcRenderer.invoke(Channel.globNodes, ...args);
  }

  makeLibraryDir = async (...args: any[]) => {
    return await ipcRenderer.invoke(Channel.makeLibraryDir, ...args);
  }

  writeFile = async (...args: any[]) => {
    return await ipcRenderer.invoke(Channel.writeFile, ...args);
  }

  getLibraryPath = async (...args: any[]) => {
    return await ipcRenderer.invoke(Channel.getLibraryPath, ...args);
  }

  //

  readBinaryFile = async (...args: any[]) => {
    return await ipcRenderer.invoke('read-binary-file', ...args);
  }

  writeBinaryFile = async (...args: any[]) => {
    return await ipcRenderer.invoke('write-binary-file', ...args);
  }

  readDir = async (...args: any[]) => {
    return await ipcRenderer.invoke('read-dir', ...args);
  }

  readDirRecursive = async (...args: any[]) => {
    return await ipcRenderer.invoke('read-dir-recursive', ...args);
  }

  makeDir = async (...args: any[]) => {
    return await ipcRenderer.invoke('make-dir', ...args);
  }

  doesExist = async (...args: any[]) => {
    return await ipcRenderer.invoke('does-exist', ...args);
  }

  saveFileDialog = async (...args: any[]) => {
    return await ipcRenderer.invoke('save-file-dialog', ...args);
  }

  fetch = async (...args: any[]) => {
    return await ipcRenderer.invoke('fetch', ...args);
  }

  fetchImage = async (...args: any[]) => {
    return await ipcRenderer.invoke('fetch-image', ...args);
  }
}

contextBridge.exposeInMainWorld('bridge', new Bridge());