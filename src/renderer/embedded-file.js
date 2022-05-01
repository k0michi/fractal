export default class EmbeddedFile {
  constructor(filename, data, mediaType) {
    this.filename = filename;
    this.data = data;
    this.mediaType = mediaType;
  }
}