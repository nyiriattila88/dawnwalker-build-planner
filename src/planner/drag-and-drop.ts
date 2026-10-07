import type { DragEvent } from 'react';
import type { Build, BuildView, QuickslotSet } from '../build/build';
import type { Ability } from '../catalog/catalog';
import type { TreeId } from '../data/trees';

// A place on the Active Abilities screen an ability can be dropped on.
export type DropTarget =
  | { readonly kind: 'slot'; readonly tree: TreeId; readonly index: number }
  | { readonly kind: 'quickslot'; readonly set: QuickslotSet; readonly index: number };

// What is being dragged: an ability, and the slot or quickslot it comes from, or null when it is picked
// up from the list of all abilities.
export type DragItem = { readonly ability: Ability; readonly from: DropTarget | null };

export const dropTargetKey = (target: DropTarget): string =>
  target.kind === 'slot'
    ? `slot-${target.tree}-${String(target.index)}`
    : `quickslot-${target.set}-${String(target.index)}`;

export function acceptsDrop(build: BuildView, item: DragItem, target: DropTarget): boolean {
  if (target.kind === 'slot') {
    return item.ability.tree === target.tree && build.canSlot(item.ability, target.index);
  }
  return build.canQuickslot(target.set, target.index, item.ability);
}

// Applies a drop to a build the caller owns. A target that does not accept the ability changes nothing.
export function applyDrop(build: Build, item: DragItem, target: DropTarget): void {
  if (!acceptsDrop(build, item, target)) return;
  if (target.kind === 'slot') {
    build.slot(item.ability, target.index);
    return;
  }
  build.setQuickslot(target.set, target.index, item.ability);
  // From the other set's quickslot it moves. From the wheel it stays there, as a quickslot needs it.
  const from = item.from;
  if (from?.kind === 'quickslot' && from.set !== target.set) {
    build.setQuickslot(from.set, from.index, null);
  }
}

// An ability dragged off its slot or quickslot and let go anywhere else leaves it.
export function applyDiscard(build: Build, item: DragItem): void {
  const from = item.from;
  if (from === null) return;
  if (from.kind === 'slot') build.unslot(from.tree, from.index);
  else build.setQuickslot(from.set, from.index, null);
}

type Box = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
};

export type DropPlace = { readonly target: DropTarget; readonly box: Box };

// How far two spans of one axis overlap.
const overlap = (start: number, size: number, otherStart: number, otherSize: number): number =>
  Math.max(0, Math.min(start + size, otherStart + otherSize) - Math.max(start, otherStart));

// The target under a dragged icon of the given size centred on the pointer: of the places that accept
// the item and that the icon overlaps at all, the one it covers most. The snap follows the whole icon,
// not only the pointer, so a slot is easy to hit on the scaled-down wheel.
export function snapTarget(
  pointer: readonly [number, number],
  icon: number,
  places: readonly DropPlace[],
  accepts: (target: DropTarget) => boolean,
): DropTarget | null {
  const left = pointer[0] - icon / 2;
  const top = pointer[1] - icon / 2;
  let best: { readonly target: DropTarget; readonly area: number } | null = null;
  for (const { target, box } of places) {
    const area = overlap(left, icon, box.left, box.width) * overlap(top, icon, box.top, box.height);
    if (area <= 0 || (best !== null && area <= best.area)) continue;
    if (accepts(target)) best = { target, area };
  }
  return best?.target ?? null;
}

// Only the ability's icon follows the pointer, centred on it, so what the user drags is the square a
// drop is measured with. Returns the icon's size.
export function centreDragImage(event: DragEvent): number {
  const icon = event.currentTarget.querySelector('.ability-icon');
  if (icon === null) return 0;
  const box = icon.getBoundingClientRect();
  event.dataTransfer.setDragImage(icon, box.width / 2, box.height / 2);
  return Math.max(box.width, box.height);
}
