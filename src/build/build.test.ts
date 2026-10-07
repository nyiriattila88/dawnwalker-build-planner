import { describe, expect, it } from 'vitest';
import { createGameCatalog } from '../catalog/game-catalog';
import type { AbilityId } from '../data/abilities';
import type { PerkId } from '../data/perks';
import type { TreeId } from '../data/trees';
import { Build } from './build';

const catalog = createGameCatalog();
const perk = (id: PerkId) => catalog.perk(id);
const ability = (id: AbilityId) => catalog.ability(id);

const withRanks = (...ids: PerkId[]): Build => {
  const build = new Build(catalog);
  for (const id of ids) build.addRank(perk(id));
  return build;
};

// Learns the perks of a tree from the top, rank by rank, until it has spent enough for an ultimate.
const spendForUltimate = (build: Build, tree: TreeId): void => {
  for (let pass = 0; pass < 5 && build.pointsToUltimate(tree) > 0; pass++) {
    for (const each of catalog.tree(tree).perks) {
      if (build.pointsToUltimate(tree) > 0) build.addRank(each);
    }
  }
};

describe('Build perks', () => {
  it('opens a perk only once the perk its line leads down from has a rank', () => {
    const build = new Build(catalog);

    build.addRank(perk('fates-favour'));
    build.addRank(perk('stinging-blade'));
    build.addRank(perk('fates-favour'));

    expect([build.rank(perk('stinging-blade')), build.rank(perk('fates-favour'))]).toEqual([1, 1]);
  });

  it('takes back every perk below when the first rank above them goes', () => {
    const build = withRanks('stinging-blade', 'fates-favour', 'precision', 'precision');

    build.removeRank(perk('stinging-blade'));

    expect(
      ['stinging-blade', 'fates-favour', 'precision'].map((id) => build.rank(perk(id as PerkId))),
    ).toEqual([0, 0, 0]);
  });

  it('stops at the last rank of a perk', () => {
    const build = withRanks('forager', 'forager', 'forager');

    expect(build.rank(perk('forager'))).toBe(2);
    expect(build.canAddRank(perk('forager'))).toBe(false);
  });

  it('adds up the skill points and time a tree costs and says when a cost is an estimate', () => {
    const seen = withRanks(...Array<PerkId>(4).fill('witchcraft-mastery'));
    const guessed = withRanks('stinging-blade', 'fates-favour');

    expect(seen.treeSpending('witchcraft')).toEqual({ skillPoints: 5, time: 4, estimated: false });
    expect(guessed.treeSpending('swordmastery').estimated).toBe(true);
  });

  it('charges nothing for a perk a quest grants', () => {
    const build = withRanks('font-of-life', 'mandrake-ward');

    expect(build.spending()).toEqual({ skillPoints: 0, time: 0, estimated: false });
    expect(build.isEmpty()).toBe(false);
  });
});

describe('Build Ultimate Perks', () => {
  it('opens a Swordmastery ultimate only after 35 points in the tree', () => {
    const build = new Build(catalog);
    const lastStand = catalog.ultimate('last-stand');

    const before = build.canTakeUltimate(lastStand);
    spendForUltimate(build, 'swordmastery');
    build.takeUltimate(lastStand);

    expect(before).toBe(false);
    expect(build.ultimate('swordmastery')?.id).toBe('last-stand');
    expect(build.treeSpending('swordmastery').skillPoints).toBeGreaterThanOrEqual(35 + 4);
  });

  it('counts only the perks of a tree toward the points its ultimates ask for', () => {
    const build = new Build(catalog);
    const swordmastery = catalog.tree('swordmastery');
    for (const ability of swordmastery.abilities) {
      ability.ranks.forEach(() => {
        build.addAbilityRank(ability);
      });
    }
    build.addRank(catalog.perk('stinging-blade'));

    expect(build.pointsToUltimate('swordmastery')).toBe(34);
    expect(build.treeSpending('swordmastery').skillPoints).toBeGreaterThan(1);
  });

  it('keeps one ultimate per tree', () => {
    const build = new Build(catalog);
    spendForUltimate(build, 'swordmastery');
    build.takeUltimate(catalog.ultimate('last-stand'));

    build.takeUltimate(catalog.ultimate('sword-sage'));

    expect(build.ultimate('swordmastery')?.id).toBe('last-stand');
  });

  it('gives up the ultimate when the tree falls below 35 points', () => {
    const build = new Build(catalog);
    spendForUltimate(build, 'swordmastery');
    build.takeUltimate(catalog.ultimate('last-stand'));

    build.removeRank(perk('omniblock'));

    expect(build.ultimate('swordmastery')).toBeNull();
  });

  it('asks no points for a Vampirism ultimate, which Corruption gates instead', () => {
    const build = new Build(catalog);

    build.takeUltimate(catalog.ultimate('renounce-death'));

    expect(build.pointsToUltimate('vampirism')).toBe(0);
    expect(build.ultimate('vampirism')?.id).toBe('renounce-death');
  });
});

describe('Build abilities and the wheel', () => {
  it('starts with the ranks the story grants, free and for keeps', () => {
    const build = new Build(catalog);

    build.removeAbilityRank(ability('dirty-trick'));

    expect(build.abilityRank(ability('dirty-trick'))).toBe(1);
    expect(build.spending().skillPoints).toBe(0);
    expect(build.isEmpty()).toBe(true);
  });

  it('gives a tree one slot, and one more for each rank of its slot perk', () => {
    const build = withRanks('sustained-focus', 'master-fencer', 'master-fencer');

    expect([build.slotCount('swordmastery'), build.slotCount('witchcraft')]).toEqual([3, 1]);
  });

  it('slots a learned ability only, and only within the slots the tree has', () => {
    const build = new Build(catalog);
    build.addAbilityRank(ability('charge'));

    build.slot(ability('broad-swing'), 0);
    build.slot(ability('charge'), 1);
    build.slot(ability('charge'), 0);

    expect([build.slotAt('swordmastery', 0)?.id, build.slotAt('swordmastery', 1)]).toEqual([
      'charge',
      null,
    ]);
  });

  it('counts a learned slotless ability as on the wheel without a slot', () => {
    const build = new Build(catalog);

    build.slot(ability('voracious-bite'), 0);

    expect(build.isSlotted(ability('voracious-bite'))).toBe(true);
    expect(build.slotAt('vampirism', 0)).toBeNull();
  });

  it('takes an ability off the wheel when the slot it sits in is lost', () => {
    const build = withRanks('sustained-focus', 'master-fencer');
    build.addAbilityRank(ability('charge'));
    build.slot(ability('charge'), 1);

    build.removeRank(perk('master-fencer'));

    expect(build.isSlotted(ability('charge'))).toBe(false);
  });

  it('raises the activation charges with Sustained Focus', () => {
    const charges = [0, 1, 2, 3, 4].map((rank) =>
      withRanks(...Array<PerkId>(rank).fill('sustained-focus')).activationCharges(),
    );

    expect(charges).toEqual([1, 2, 2, 3, 4]);
  });
});

describe('Build quickslots', () => {
  const armed = (): Build => {
    const build = withRanks('unnatural-resilience', 'forbidden-sigils');
    build.slot(ability('burning-blood'), 0);
    build.addAbilityRank(ability('cycle-of-ruin'));
    build.slot(ability('cycle-of-ruin'), 1);
    build.slot(ability('dirty-trick'), 0);
    return build;
  };

  it('offers the day set the active abilities of Swordmastery and Witchcraft on the wheel', () => {
    const build = armed();

    expect(build.quickslotChoices('day').map((choice) => choice.id)).toEqual([
      'burning-blood',
      'dirty-trick',
    ]);
    expect(build.quickslotChoices('night').map((choice) => choice.id)).toEqual(['dirty-trick']);
  });

  it('moves an ability that is set on a second quickslot of the same set', () => {
    const build = armed();
    build.setQuickslot('day', 0, ability('burning-blood'));

    build.setQuickslot('day', 2, ability('burning-blood'));

    expect([build.quickslotAt('day', 0), build.quickslotAt('day', 2)?.id]).toEqual([
      null,
      'burning-blood',
    ]);
  });

  it('clears a quickslot whose ability leaves the wheel', () => {
    const build = armed();
    build.setQuickslot('night', 1, ability('dirty-trick'));

    build.unslot('swordmastery', 0);

    expect(build.quickslotAt('night', 1)).toBeNull();
  });

  it('copies a build so that changing the copy leaves the original alone', () => {
    const original = armed();

    const copy = original.clone();
    copy.unslot('witchcraft', 0);

    expect(original.slotAt('witchcraft', 0)?.id).toBe('burning-blood');
  });
});
