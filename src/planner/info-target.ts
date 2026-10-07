import type { Ability, Perk, Tree, Ultimate } from '../catalog/catalog';

// What the info panel describes: the node under the pointer or in focus, or the tree when none is.
export type InfoTarget =
  | { readonly kind: 'tree'; readonly tree: Tree }
  | { readonly kind: 'perk'; readonly perk: Perk }
  | { readonly kind: 'ultimate'; readonly ultimate: Ultimate }
  | { readonly kind: 'ability'; readonly ability: Ability };

// Two targets name the same node.
export const sameTarget = (a: InfoTarget, b: InfoTarget): boolean => {
  switch (a.kind) {
    case 'tree':
      return b.kind === 'tree' && b.tree.id === a.tree.id;
    case 'perk':
      return b.kind === 'perk' && b.perk.id === a.perk.id;
    case 'ultimate':
      return b.kind === 'ultimate' && b.ultimate.id === a.ultimate.id;
    case 'ability':
      return b.kind === 'ability' && b.ability.id === a.ability.id;
  }
};
