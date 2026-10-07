import { describe, expect, it } from 'vitest';
import { createGameCatalog } from '../catalog/game-catalog';
import { Build, type QuickslotSet } from './build';
import { createBuildCodec } from './build-code';

const catalog = createGameCatalog();
const codec = createBuildCodec(catalog);

// A seeded generator, so a failing build can be reproduced.
const random = (seed: number) => {
  let state = seed;
  return (below: number): number => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state % below;
  };
};

const pick = <T>(roll: (below: number) => number, items: readonly T[]): T => {
  const item = items[roll(items.length)];
  if (item === undefined) throw new Error('Picked from an empty list');
  return item;
};

// Whatever a player could click together: ranks, ultimates, the wheel and both quickslot sets.
const randomBuild = (seed: number): Build => {
  const roll = random(seed);
  const build = new Build(catalog);
  for (let step = 0; step < 160; step++) build.addRank(pick(roll, catalog.perks));
  for (let step = 0; step < 40; step++) build.addAbilityRank(pick(roll, catalog.abilities));
  for (const tree of catalog.trees) {
    if (roll(2) === 0) build.takeUltimate(pick(roll, tree.ultimates));
    for (let index = 0; index < 4; index++) build.slot(pick(roll, tree.abilities), index);
  }
  for (const set of ['day', 'night'] as const satisfies readonly QuickslotSet[]) {
    const choices = build.quickslotChoices(set);
    for (let index = 0; index < 4 && choices.length > 0; index++) {
      build.setQuickslot(set, index, pick(roll, choices));
    }
  }
  return build;
};

const fullBuild = (): Build => {
  const build = new Build(catalog);
  for (let pass = 0; pass < 5; pass++) {
    for (const perk of catalog.perks) build.addRank(perk);
    for (const ability of catalog.abilities) build.addAbilityRank(ability);
  }
  for (const tree of catalog.trees) {
    const ultimate = tree.ultimates[2];
    if (ultimate !== undefined) build.takeUltimate(ultimate);
    const slottable = tree.abilities.filter((ability) => ability.kind !== 'slotless');
    slottable.slice(0, 4).forEach((ability, index) => {
      build.slot(ability, index);
    });
  }
  for (const set of ['day', 'night'] as const satisfies readonly QuickslotSet[]) {
    build
      .quickslotChoices(set)
      .slice(0, 4)
      .forEach((ability, index) => {
        build.setQuickslot(set, index, ability);
      });
  }
  return build;
};

describe('createBuildCodec', () => {
  it('writes an empty build as A', () => {
    expect(codec.encode(new Build(catalog))).toBe('A');
  });

  it('reads back every random build exactly', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const build = randomBuild(seed);

      const code = codec.encode(build);
      const decoded = codec.decode(code);

      expect(decoded === null ? null : codec.encode(decoded), `seed ${seed}`).toBe(code);
    }
  });

  it('writes a build with everything filled in fewer than seventy characters', () => {
    const build = fullBuild();

    const code = codec.encode(build);

    expect(code.length).toBeLessThan(70);
    expect(codec.decode(code)?.spending()).toEqual(build.spending());
  });

  it('rejects text that is not a whole build code', () => {
    const inputs = ['', 'not a code', '!', 'z'.repeat(200)];

    expect(inputs.map((input) => codec.decode(input))).toEqual(inputs.map(() => null));
  });

  // Shared links carry these. A data change that alters them breaks every link already out there.
  it('keeps writing the codes it wrote before', () => {
    const small = new Build(catalog);
    small.addRank(catalog.perk('stinging-blade'));
    small.addRank(catalog.perk('stinging-blade'));
    small.addRank(catalog.perk('fates-favour'));
    small.addAbilityRank(catalog.ability('charge'));
    small.slot(catalog.ability('charge'), 0);
    small.setQuickslot('day', 0, catalog.ability('charge'));

    expect([codec.encode(small), codec.encode(fullBuild())]).toEqual([
      'BK9vcpGz_wvW1KAS7GxPWNnxHAAAZefB0gAA',
      'RwKTiz6GQrM143i0ukJjZp8pIG3____________',
    ]);
  });

  it('rejects a second spelling of a build', () => {
    expect(codec.decode('AA')).toBeNull();
    expect(codec.decode('A')?.isEmpty()).toBe(true);
  });
});
