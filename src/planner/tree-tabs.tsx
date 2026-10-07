import type { JSX } from 'react';
import type { BuildView } from '../build/build';
import type { Tree } from '../catalog/catalog';
import { TreeEmblem } from './tree-emblem';

type TreeTabsProps = {
  readonly trees: readonly Tree[];
  readonly current: Tree;
  readonly build: BuildView;
  readonly onSelect: (tree: Tree) => void;
};

// Witchcraft, Swordmastery and Vampirism, in the order of the game's character screen.
export function TreeTabs({ trees, current, build, onSelect }: TreeTabsProps): JSX.Element {
  return (
    <nav className="tree-tabs" aria-label="Skill trees">
      {trees.map((tree) => {
        const points = build.treeSpending(tree.id).skillPoints;
        return (
          <button
            key={tree.id}
            type="button"
            className={`tree-tab tree-${tree.id}${tree.id === current.id ? ' active' : ''}`}
            aria-pressed={tree.id === current.id}
            onClick={() => {
              onSelect(tree);
            }}
          >
            <TreeEmblem tree={tree.id} />
            {tree.name}
            <span
              className="tree-points"
              aria-label={`${points} skill point${points === 1 ? '' : 's'}`}
            >
              {points}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
