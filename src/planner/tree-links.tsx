import type { JSX } from 'react';
import type { BuildView } from '../build/build';
import type { Tree } from '../catalog/catalog';
import { toView, TREE_VIEW } from './geometry';

type TreeLinksProps = {
  readonly tree: Tree;
  readonly build: BuildView;
};

// The lines between perks, drawn as the game draws them: down from the parent to the row of the
// child, then across. Two children of one parent share the line down and form a T.
export function TreeLinks({ tree, build }: TreeLinksProps): JSX.Element {
  return (
    <svg className="links" width={TREE_VIEW.width} height={TREE_VIEW.height} aria-hidden="true">
      {tree.perks.map((perk) => {
        if (perk.requires === null) return null;
        const [x1, y1] = toView(perk.requires.position);
        const [x2, y2] = toView(perk.position);
        const path = y1 === y2 ? `M${x1},${y1} H${x2}` : `M${x1},${y1} V${y2} H${x2}`;
        return (
          <path
            key={perk.id}
            d={path}
            className={build.rank(perk.requires) > 0 ? 'lit' : undefined}
          />
        );
      })}
    </svg>
  );
}
