import { app, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

import * as fileKind from './file-kind';
import { fetchMeta } from './fetch';

export function registerHandlers() {
  ipcMain.handle('open-file', async (e) => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'] });

    if (!result.canceled) {
      return result.filePaths[0];
    } else {
      return null;
    }
  });

  ipcMain.handle('read-file', async (e, filePath) => {
    return await fs.readFile(filePath, { encoding: 'utf-8' });
  });

  ipcMain.handle('read-binary-file', async (e, filePath) => {
    return await fs.readFile(filePath);
  });

  ipcMain.handle('write-file', async (e, filePath, data) => {
    return await fs.writeFile(filePath, data);
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
  });

  ipcMain.handle('read-dir-recursive', async (e, dirPath) => {
    return await readDirRecursive(dirPath);
  });

  async function readDirRecursive(dirPath) {
    const dir = await fs.opendir(dirPath);
    const ents = [];

    for await (const dirent of dir) {
      const pathToEnt = path.join(dirPath, dirent.name);
      const name = dirent.name;
      let kind;

      if (dirent.isFile()) {
        kind = fileKind.FILE;
        ents.push({ path: pathToEnt, name, kind });
      } else if (dirent.isDirectory()) {
        kind = fileKind.DIRECTORY;
        const childEnts = await readDirRecursive(path.join(dirPath, dirent.name));
        ents.push({ path: pathToEnt, name, kind, ents: childEnts });
      }
    }

    return ents;
  }

  ipcMain.handle('make-dir', async (e, dirPath) => {
    return await fs.mkdir(dirPath, { recursive: true });
  });

  ipcMain.handle('get-path', async (e, name) => {
    return app.getPath(name);
  });

  ipcMain.handle('does-exist', async (e, filePath) => {
    try {
      await fs.access(filePath);
      return true;
    } catch (e) {
      return false;
    }
  });

  ipcMain.handle('fetch', async (e, url) => {
    return await fetchMeta(url);
  });
}