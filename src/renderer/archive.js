import * as zip from '@zip.js/zip.js';
import EmbeddedFile from './embedded-file';
import * as SKML from './skml';
import { filetypemime } from 'magic-bytes.js';

export async function toArchive(note) {
  const arrayWriter = new zip.Uint8ArrayWriter();
  const writer = new zip.ZipWriter(arrayWriter);
  await writer.add('index.skml', new zip.TextReader(SKML.toSKML(note)));

  for (const file of note.files) {
    await writer.add(file.filename, new zip.Uint8ArrayReader(file.data));
  }

  await writer.close();
  return arrayWriter.getData();
}

export async function fromArchive(data) {
  const reader = new zip.ZipReader(new zip.Uint8ArrayReader(data));
  const entries = await reader.getEntries();
  let index;
  const files = [];
  const promises = [];

  for (const entry of entries) {
    promises.push((async () => {
      if (entry.filename == 'index.skml') {
        index = await entry.getData(new zip.TextWriter());
      } else {
        const data = await entry.getData(new zip.Uint8ArrayWriter());
        const mediaType = filetypemime(data)[0];
        files.push(new EmbeddedFile(entry.filename, data, mediaType));
      }
    })());
  }

  await Promise.all(promises);

  if (index == null) {
    throw new Error('Unsupported format');
  }

  await reader.close();
  return SKML.fromSKML(index, files);
}