import { useModel, useObservable } from 'kyoka';
import * as React from 'react'
import AppModel from '../app-model';
import { NoteEntry, Note } from '../note';

export default function Library() {
  const model = useModel<AppModel>();
  const rootNote = useObservable(model.library.rootNote);
  const activeNote = useObservable(model.activeEditor)?.note;

  return (
    <div id="library">
      <ul>
        {rootNote != null ? treeToList(rootNote, 0, model, activeNote) : null}
      </ul>
    </div>
  );
};

function treeToList(notes: NoteEntry | NoteEntry[], depth: number, model: AppModel, currentNote: Note | undefined): React.ReactElement[] {
  const list: React.ReactElement[] = [];

  if (Array.isArray(notes)) {
    for (const n of notes) {
      let title = n.head!.title;

      if (title.length == 0) {
        title = n.head!.id;
      }

      const selected = n.head?.id == currentNote?.head.id;

      list.push(<li
        style={{ paddingLeft: depth * 16 + 8 + 'px' }}
        className={selected ? 'selected' : ''}
        onClick={() => model.library.onClickItem(n)}
        key={n.head?.id}
      >
        {title}
      </li>);
      const children = treeToList(n.children, depth + 1, model, currentNote);
      list.push(...children);
    }

    return list;
  } else {
    return treeToList([notes], depth, model, currentNote);
  }
}