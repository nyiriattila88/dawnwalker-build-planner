import type { AbilityData, AbilityId } from '../data/abilities';
import type { AbilityWheelData } from '../data/ability-wheel';
import type { PerkData, PerkId } from '../data/perks';
import type { Timing, TreeData, TreeId } from '../data/trees';
import type { UltimateData, UltimateId } from '../data/ultimates';

export type Perk = Omit<PerkData, 'id' | 'requires'> & {
  readonly id: PerkId;
  // The perk a line leads down from, which needs a rank before this one opens.
  readonly requires: Perk | null;
};

export type Ultimate = Omit<UltimateData, 'id'> & { readonly id: UltimateId };

export type Ability = Omit<AbilityData, 'id'> & {
  readonly id: AbilityId;
  // Abilities follow the form of their tree, unlike perks, which carry their own label.
  readonly timing: Timing;
};

export type Tree = TreeData & {
  readonly perks: readonly Perk[];
  readonly ultimates: readonly Ultimate[];
  readonly abilities: readonly Ability[];
  readonly slotPerk: Perk;
};

export type Catalog = {
  readonly trees: readonly Tree[];
  readonly perks: readonly Perk[];
  readonly ultimates: readonly Ultimate[];
  readonly abilities: readonly Ability[];
  readonly wheel: AbilityWheelData;
  readonly chargePerk: Perk;
  readonly tree: (id: TreeId) => Tree;
  readonly perk: (id: PerkId) => Perk;
  readonly ultimate: (id: UltimateId) => Ultimate;
  readonly ability: (id: AbilityId) => Ability;
};

export type CatalogSources = {
  readonly trees: readonly TreeData[];
  readonly perks: readonly PerkData[];
  readonly ultimates: readonly UltimateData[];
  readonly abilities: readonly AbilityData[];
  readonly wheel: AbilityWheelData;
};

const lookup = <K extends string, V>(entries: readonly V[], key: (value: V) => K, what: string) => {
  const map = new Map<K, V>();
  for (const value of entries) {
    if (map.has(key(value))) throw new Error(`Two ${what} share the id "${key(value)}"`);
    map.set(key(value), value);
  }
  return (id: K): V => {
    const found = map.get(id);
    if (found === undefined) throw new Error(`No ${what} "${id}"`);
    return found;
  };
};

// Joins the game data into lookups and checks every reference once, so a broken one stops the page
// from opening instead of showing a tree that cannot be built.
export function createCatalog(sources: CatalogSources): Catalog {
  const perkData = lookup(sources.perks, (p) => p.id as PerkId, 'perk');
  const perks = new Map<PerkId, Perk>();
  const resolve = (data: PerkData, path: readonly PerkId[]): Perk => {
    const id = data.id as PerkId;
    const known = perks.get(id);
    if (known !== undefined) return known;
    if (path.includes(id))
      throw new Error(`The perk "${id}" requires itself through ${path.join(', ')}`);
    const parent =
      data.requires === null ? null : resolve(perkData(data.requires as PerkId), [...path, id]);
    if (parent !== null && parent.tree !== data.tree) {
      throw new Error(`The perk "${id}" requires "${parent.id}" from another tree`);
    }
    const perk: Perk = { ...data, id, requires: parent };
    perks.set(id, perk);
    return perk;
  };
  const allPerks = sources.perks.map((data) => resolve(data, []));
  // A build code adds ranks in this order, which only works when a parent comes before its children.
  allPerks.forEach((perk, index) => {
    if (perk.requires !== null && allPerks.indexOf(perk.requires) > index) {
      throw new Error(
        `The perk "${perk.id}" comes before "${perk.requires.id}", which it requires`,
      );
    }
  });
  const ultimates = sources.ultimates.map((data): Ultimate => ({
    ...data,
    id: data.id as UltimateId,
  }));
  const treeTiming = lookup(sources.trees, (t) => t.id, 'tree');
  const abilities = sources.abilities.map((data): Ability => ({
    ...data,
    id: data.id as AbilityId,
    timing: treeTiming(data.tree).timing,
  }));
  const perk = lookup(allPerks, (p) => p.id, 'perk');

  const trees = sources.trees.map((data): Tree => {
    const slotPerk = perk(sources.wheel.slotPerks[data.id]);
    if (slotPerk.tree !== data.id)
      throw new Error(`The slot perk of ${data.id} sits in ${slotPerk.tree}`);
    const own = <T extends { readonly tree: TreeId }>(entries: readonly T[]) =>
      entries.filter((entry) => entry.tree === data.id);
    const cells = new Set(own(abilities).map((a) => a.cell.join(',')));
    if (cells.size !== own(abilities).length)
      throw new Error(`Two abilities of ${data.id} share a cell`);
    return {
      ...data,
      perks: own(allPerks),
      ultimates: own(ultimates),
      abilities: own(abilities),
      slotPerk,
    };
  });

  return {
    trees,
    perks: allPerks,
    ultimates,
    abilities,
    wheel: sources.wheel,
    chargePerk: perk(sources.wheel.chargePerk),
    tree: lookup(trees, (t) => t.id, 'tree'),
    perk,
    ultimate: lookup(ultimates, (u) => u.id, 'ultimate'),
    ability: lookup(abilities, (a) => a.id, 'ability'),
  };
}
