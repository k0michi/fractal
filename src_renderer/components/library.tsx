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
        {rootNote != null ? treeToList(model.library, rootNote, 0) : null}
      </ul>
    </div>
  );
};

function treeToList(library: Library, notes: NoteEntry | NoteEntry[], depth: number) {
  const list: React.ReactElement[] = [];

  if (Array.isArray(notes)) {
    for (const n of notes) {
      let title = n.head!.title;

      if (title.length == 0) {
        title = n.head!.id;
      }

      list.push(<li style={{ paddingLeft: depth * 24 + 'px' }}><a href="#" onClick={() => library.onClickItem(n)}>{title}</a></li>);
      const children = treeToList(library, n.children, depth + 1);
      list.push(children);
    }

    return <>{list}</>;
  } else {
    return treeToList(library, [notes], depth);
  }
}