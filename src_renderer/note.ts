export type Head = { [name: string]: any };

export interface NoteEntry {
  path?: string;
  head?: Head;
  children: NoteEntry[];
}

export interface Note {
  path?: string
  head: Head;
  body: Element;
}