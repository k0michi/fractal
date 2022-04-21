// Modules to control application life and create native browser window

import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

import * as fileKind from './file-kind';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

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

ipcMain.handle('save-file', async (e, filePath, data) => {
  return await fs.writeFile(filePath, data);
});

ipcMain.handle('save-file-dialog', async (e, filePath, data) => {
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
      ents.push({ path: pathToEnt, name, kind, ents:childEnts });
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