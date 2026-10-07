import { describe, expect, it } from 'vitest';
import { Build } from '../build/build';
import { createGameCatalog } from '../catalog/game-catalog';
import {
  acceptsDrop,
  applyDiscard,
  applyDrop,
  snapTarget,
  type DropPlace,
  type DropTarget,
} from './drag-and-drop';

const catalog = createGameCatalog();
const dirtyTrick = catalog.ability('dirty-trick');
const burningBlood = catalog.ability('burning-blood');
const charge = catalog.ability('charge');

const slot = (tree: 'witchcraft' | 'swordmastery' | 'vampirism', index: number): DropTarget => ({
  kind: 'slot',
  tree,
  index,
});
const quickslot = (set: 'day' | 'night', index: number): DropTarget => ({
  kind: 'quickslot',
  set,
  index,
});

// A build with two Swordmastery slots, both abilities learned.
const twoSlots = (): Build => {
  const build = new Build(catalog);
  build.addRank(catalog.perk('sustained-focus'));
  build.addRank(catalog.perk('master-fencer'));
  build.addAbilityRank(charge);
  return build;
};

describe('acceptsDrop', () => {
  it('takes an ability on an open slot of its own tree only', () => {
    const build = twoSlots();

    expect([
      acceptsDrop(build, { ability: dirtyTrick, from: null }, slot('swordmastery', 1)),
      acceptsDrop(build, { ability: dirtyTrick, from: null }, slot('swordmastery', 2)),
      acceptsDrop(build, { ability: dirtyTrick, from: null }, slot('witchcraft', 0)),
    ]).toEqual([true, false, false]);
  });

  it('takes an ability on a quickslot only once it is on the wheel', () => {
    const build = twoSlots();
    const before = acceptsDrop(build, { ability: dirtyTrick, from: null }, quickslot('day', 0));
    build.slot(dirtyTrick, 0);

    expect([
      before,
      acceptsDrop(build, { ability: dirtyTrick, from: null }, quickslot('day', 0)),
    ]).toEqual([false, true]);
  });
});

describe('applyDrop', () => {
  it('swaps two abilities when one is dragged onto the slot of the other', () => {
    const build = twoSlots();
    build.slot(dirtyTrick, 0);
    build.slot(charge, 1);

    applyDrop(build, { ability: charge, from: slot('swordmastery', 1) }, slot('swordmastery', 0));

    expect([build.slotAt('swordmastery', 0), build.slotAt('swordmastery', 1)]).toEqual([
      charge,
      dirtyTrick,
    ]);
  });

  it('moves a quickslot to the other set and keeps the ability on the wheel', () => {
    const build = twoSlots();
    build.slot(dirtyTrick, 0);
    build.setQuickslot('day', 0, dirtyTrick);

    applyDrop(build, { ability: dirtyTrick, from: quickslot('day', 0) }, quickslot('night', 2));

    expect([
      build.quickslotAt('day', 0),
      build.quickslotAt('night', 2),
      build.isSlotted(dirtyTrick),
    ]).toEqual([null, dirtyTrick, true]);
  });

  it('changes nothing on a target that does not take the ability', () => {
    const build = twoSlots();
    build.slot(burningBlood, 0);

    applyDrop(
      build,
      { ability: burningBlood, from: slot('witchcraft', 0) },
      slot('swordmastery', 0),
    );

    expect([build.slotAt('witchcraft', 0), build.slotAt('swordmastery', 0)]).toEqual([
      burningBlood,
      null,
    ]);
  });
});

describe('applyDiscard', () => {
  it('takes an ability dragged off its slot or quickslot away from it', () => {
    const build = twoSlots();
    build.slot(dirtyTrick, 0);
    build.slot(charge, 1);
    build.setQuickslot('night', 1, charge);

    applyDiscard(build, { ability: dirtyTrick, from: slot('swordmastery', 0) });
    applyDiscard(build, { ability: charge, from: quickslot('night', 1) });

    expect([
      build.slotAt('swordmastery', 0),
      build.quickslotAt('night', 1),
      build.isSlotted(charge),
    ]).toEqual([null, null, true]);
  });
});

describe('snapTarget', () => {
  const places: readonly DropPlace[] = [
    { target: slot('swordmastery', 0), box: { left: 0, top: 0, width: 60, height: 60 } },
    { target: slot('swordmastery', 1), box: { left: 70, top: 0, width: 60, height: 60 } },
  ];
  const anywhere = (): boolean => true;

  it('snaps to the place the dragged icon covers most', () => {
    const target = snapTarget([80, 30], 60, places, anywhere);

    expect(target).toEqual(slot('swordmastery', 1));
  });

  it('takes a place the icon overlaps by a pixel, and none the icon misses', () => {
    const touching = snapTarget([-29, 30], 60, places, anywhere);
    const missing = snapTarget([-31, 30], 60, places, anywhere);

    expect([touching, missing]).toEqual([slot('swordmastery', 0), null]);
  });

  it('passes over a place that refuses the item for the next one the icon covers', () => {
    const target = snapTarget([80, 30], 60, places, (t) => t.kind === 'slot' && t.index === 0);

    expect(target).toEqual(slot('swordmastery', 0));
  });
});
