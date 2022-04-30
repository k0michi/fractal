import Note from "./note";
import NoteFile from "./note-file";
import * as skml from './skml';
import * as archive from './archive';

export async function openNoteFile(path) {
  const data = await bridge.readBinaryFile(path);
  const noteFile = new NoteFile(path, await archive.fromArchive(data));
  return noteFile;
}

export async function doesExist(dir, path) {
  return await bridge.doesExist(`${dir}/${path}`);
}