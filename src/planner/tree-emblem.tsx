import type { JSX } from 'react';
import type { TreeId } from '../data/trees';
import { treeEmblemUrl } from './asset-urls';

type TreeEmblemProps = {
  readonly tree: TreeId;
};

// A tree's sign in a thin diamond, as the game's tabs and Active Abilities screen show it, drawn in
// the colour of the text beside it.
export function TreeEmblem({ tree }: TreeEmblemProps): JSX.Element {
  return (
    <span className="emblem" aria-hidden="true">
      <span className="emblem-sign" style={{ maskImage: `url("${treeEmblemUrl(tree)}")` }} />
    </span>
  );
}
