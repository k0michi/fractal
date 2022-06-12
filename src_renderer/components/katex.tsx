import katex from 'katex';
import * as React from 'react';

import 'katex/dist/katex.min.css';

interface KatexProps {
  children?: string;
}

export default function Katex(props: KatexProps) {
  const rendered = React.useMemo(() => {
    return katex.renderToString(props.children ?? '', { displayMode: true });
  }, [props.children]);

  return (
    <div dangerouslySetInnerHTML={{ __html: rendered }}></div>
  );
}