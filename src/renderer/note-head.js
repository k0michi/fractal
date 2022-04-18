export default class NoteHead {
  constructor(properties) {
    this.properties = properties;
  }

  static create(title, created, modified) {
    const now = Date.now();

    return new NoteHead({
      title,
      created: created ?? now,
      modified: modified ?? now
    });
  }

  setProperty(key, value) {
    this.properties[key] = value;
  }

  getProperty(key) {
    return this.properties[key];
  }

  removeProperty() {
    delete this.properties[key];
  }
}