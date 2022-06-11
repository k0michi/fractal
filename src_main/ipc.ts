import { app, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import Channel from './channel';
import { promisify } from "util";
import glob from "glob-promise";

//import * as fileKind from './file-kind';
//import { fetchImage, fetchMeta } from './fetch';

const userDataPath = app.getPath('userData');
const libraryPath = path.join(app.getPath('userData'), 'library');

export function registerHandlers() {
  ipcMain.handle(Channel.showFileOpenDialog, async (e) => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'] });

    if (!result.canceled) {
      return result.filePaths[0];
    } else {
      return null;
    }
  });

  ipcMain.handle(Channel.readFileUTF8, async (e, filePath) => {
    return await fs.readFile(filePath, { encoding: 'utf-8' });
  });

  ipcMain.handle(Channel.globNodes, async (e, pattern) => {
    return await glob('**/*.miml', { cwd: libraryPath, absolute: true });
  });

  ipcMain.handle(Channel.makeLibraryDir, async (e, pattern) => {
    await fs.mkdir(libraryPath, { recursive: true });
  });

  ipcMain.handle(Channel.writeFile, async (e, filePath, data) => {
    await fs.mkdir(path.dirname(filePath), {recursive:true});
    return await fs.writeFile(filePath, data);
  });

  ipcMain.handle(Channel.getLibraryPath, async (e, filePath, data) => {
    return libraryPath;
  });

  //

  ipcMain.handle('read-binary-file', async (e, filePath) => {
    return await fs.readFile(filePath);
  });

  ipcMain.handle('write-binary-file', async (e, filePath, data) => {
    return await fs.writeFile(filePath, data);
  });

  ipcMain.handle('save-file-dialog', async (e) => {
    const result = await dialog.showSaveDialog({ properties: ['createDirectory'] });

    if (!result.canceled) {
      return result.filePath;
    } else {
      return null;
    }
  });

  /*
  ipcMain.handle('read-dir', async (e, dirPath) => {
    const dir = await fs.opendir(dirPath);
    const ents = [];

    for await (const dirent of dir) {
      const pathToEnt = path.join(dirPath, dirent.name);
      const name = dirent.name;
      let kind;

      if (dirent.isFile()) {
        kind = fileKind.FILE;
      } else if (dirent.isDirectory()) {
        kind = fileKind.DIRECTORY;
      }

      ents.push({ path: pathToEnt, name, kind });
    }

    return ents;
  });*/

  ipcMain.handle('make-dir', async (e, dirPath) => {
    return await fs.mkdir(dirPath, { recursive: true });
  });

  ipcMain.handle('does-exist', async (e, filePath) => {
    try {
      await fs.access(filePath);
      return true;
    } catch (e) {
      return false;
    }
  });/*

  ipcMain.handle('fetch', async (e, url) => {
    return await fetchMeta(url);
  });

  ipcMain.handle('fetch-image', async (e, url) => {
    return await fetchImage(url);
  });*/
}