import { useModel, useObservable } from 'kyoka';
import * as React from 'react'
import AppModel from '../app-model';
import Library, { NoteEntry } from '../library';

export default function LibraryComponent() {
  const model = useModel<AppModel>();
  const rootNote = useObservable(model.library.rootNote);

  return (
    <div id="library">
      <ul>
        {rootNote != null ? treeToList(model, rootNote, 0) : null}
      </ul>
    </div>
  );
};

function treeToList(model: AppModel, notes: NoteEntry | NoteEntry[], depth: number) {
  const list: React.ReactElement[] = [];

  if (Array.isArray(notes)) {
    for (const n of notes) {
      let title = n.head!.title;

      if (title.length == 0) {
        title = n.head!.id;
      }

      const selected = n.head?.id == model.note.get()?.head.id;

      list.push(<li
        style={{ paddingLeft: depth * 24 + 'px' }}
        className={selected ? 'selected' : ''}
        onClick={() => model.library.onClickItem(n)}
      >
        {title}
      </li>);
      const children = treeToList(model, n.children, depth + 1);
      list.push(children);
    }

    return <>{list}</>;
  } else {
    return treeToList(model, [notes], depth);
  }
}