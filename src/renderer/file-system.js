import Note from "./note";
import NoteFile from "./note-file";

export async function openNoteFile(path) {
  const text = await bridge.readFile(path);
  const noteFile = new NoteFile(path, Note.fromXML(text));
  return noteFile;
}

export async function doesExist(dir, path) {
  return await bridge.doesExist(`${dir}/${path}`);
}