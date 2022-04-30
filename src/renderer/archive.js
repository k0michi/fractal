import * as zip from '@zip.js/zip.js';
import * as SKML from './skml';

export async function toArchive(note) {
  const arrayWriter = new zip.Uint8ArrayWriter();
  const writer = new zip.ZipWriter(arrayWriter);
  await writer.add('index.skml', new zip.TextReader(SKML.toSKML(note)));
  await writer.close();
  return arrayWriter.getData();
}

function findEntry(entries, filename) {
  return entries.find(e => e.filename == filename);
}

export async function fromArchive(data) {
  const reader = new zip.ZipReader(new zip.Uint8ArrayReader(data));
  const entries = await reader.getEntries();
  const indexEntry = findEntry(entries, 'index.skml');

  if (indexEntry == null) {
    throw new Error('Unsupported format');
  }

  const index = await indexEntry.getData(new zip.TextWriter());
  await reader.close();
  return SKML.fromSKML(index);
}