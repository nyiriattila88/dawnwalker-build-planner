import { describe, expect, it } from 'vitest';
import { ABILITIES } from '../data/abilities';
import { ABILITY_WHEEL } from '../data/ability-wheel';
import { PERKS, type PerkData } from '../data/perks';
import { TREES } from '../data/trees';
import { ULTIMATES } from '../data/ultimates';
import { createCatalog, type CatalogSources } from './catalog';
import { createGameCatalog } from './game-catalog';

const sources = (perks: readonly PerkData[]): CatalogSources => ({
  trees: TREES,
  perks,
  ultimates: ULTIMATES,
  abilities: ABILITIES,
  wheel: ABILITY_WHEEL,
});

describe('createCatalog', () => {
  it('joins every perk to the perk its line leads down from', () => {
    const catalog = createGameCatalog();

    const precision = catalog.perk('precision');

    expect(precision.requires?.id).toBe('fates-favour');
    expect(precision.requires?.requires?.id).toBe('stinging-blade');
    expect(catalog.perk('stinging-blade').requires).toBeNull();
  });

  it('gathers the perks, ultimates and abilities of each tree in the order of its tabs', () => {
    const catalog = createGameCatalog();

    const counts = catalog.trees.map((tree) => [
      tree.id,
      tree.perks.length,
      tree.ultimates.length,
      tree.abilities.length,
    ]);

    expect(counts).toEqual([
      ['witchcraft', 18, 3, 10],
      ['swordmastery', 19, 3, 7],
      ['vampirism', 17, 3, 10],
    ]);
  });

  it('gives each tree the perk that opens its ability slots and abilities the timing of their tree', () => {
    const catalog = createGameCatalog();

    expect(catalog.trees.map((tree) => tree.slotPerk.id)).toEqual([
      'forbidden-sigils',
      'master-fencer',
      'vrakhiri-might',
    ]);
    expect(catalog.ability('burning-blood').timing).toBe('day');
    expect(catalog.ability('shred').timing).toBe('night');
  });

  it('refuses a perk that requires a perk the data does not have', () => {
    const broken = PERKS.map((perk) =>
      perk.id === 'precision' ? { ...perk, requires: 'nope' } : perk,
    );

    expect(() => createCatalog(sources(broken))).toThrow(/No perk "nope"/);
  });

  it('refuses a perk that comes before the perk it requires, which a build code could not open', () => {
    const swapped = [...PERKS].sort((a, b) =>
      a.id === 'precision' ? -1 : b.id === 'precision' ? 1 : 0,
    );

    expect(() => createCatalog(sources(swapped))).toThrow(
      /"precision" comes before "fates-favour"/,
    );
  });

  it('refuses a perk that requires a perk of another tree', () => {
    const crossed = PERKS.map((perk) =>
      perk.id === 'precision' ? { ...perk, requires: 'forager' } : perk,
    );

    expect(() => createCatalog(sources(crossed))).toThrow(/from another tree/);
  });
});
