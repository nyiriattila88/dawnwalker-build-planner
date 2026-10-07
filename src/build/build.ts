import type { Ability, Catalog, Perk, Ultimate } from '../catalog/catalog';
import type { AbilityId } from '../data/abilities';
import type { PerkId } from '../data/perks';
import type { CostData, RankData } from '../data/ranks';
import type { TreeId } from '../data/trees';
import type { UltimateId } from '../data/ultimates';
import type { QueryView } from './query-view';

// The two sets of quickslots: the day set takes Swordmastery and Witchcraft, the night set
// Swordmastery and Vampirism, the way Coen fights in each form.
export type QuickslotSet = 'day' | 'night';

export const QUICKSLOT_TREES: Readonly<Record<QuickslotSet, readonly TreeId[]>> = {
  day: ['swordmastery', 'witchcraft'],
  night: ['swordmastery', 'vampirism'],
};

// What a build has spent: skill points, segments of the thirty day clock, and whether any of it
// comes from a cost that was estimated rather than read from the game.
export type Spending = {
  readonly skillPoints: number;
  readonly time: number;
  readonly estimated: boolean;
};

const NOTHING: Spending = { skillPoints: 0, time: 0, estimated: false };

const combine = (total: Spending, more: Spending | CostData): Spending => ({
  skillPoints: total.skillPoints + more.skillPoints,
  time: total.time + more.time,
  estimated: total.estimated || more.estimated,
});

// What learning ranks from + 1 up to `to` cost.
const sum = (ranks: readonly RankData[], from: number, to: number): Spending =>
  ranks.slice(from, to).reduce((total, rank) => combine(total, rank.cost), NOTHING);

export type BuildView = Omit<QueryView<Build>, 'clone'>;

// A planned character: perk and ability ranks, one Ultimate Perk per tree, the abilities on the
// wheel and the two quickslot sets. Every command leaves it valid, so the rules live here only.
export class Build {
  readonly #catalog: Catalog;
  readonly #perkRanks = new Map<PerkId, number>();
  readonly #abilityRanks = new Map<AbilityId, number>();
  readonly #ultimates = new Map<TreeId, UltimateId>();
  readonly #slots = new Map<TreeId, (AbilityId | null)[]>();
  readonly #quickslots: Record<QuickslotSet, (AbilityId | null)[]>;

  constructor(catalog: Catalog) {
    this.#catalog = catalog;
    for (const ability of catalog.abilities) {
      if (ability.granted > 0) this.#abilityRanks.set(ability.id, ability.granted);
    }
    for (const tree of catalog.trees) this.#slots.set(tree.id, this.#emptySlots());
    const empty = (): (AbilityId | null)[] =>
      Array<AbilityId | null>(catalog.wheel.quickslots).fill(null);
    this.#quickslots = { day: empty(), night: empty() };
  }

  clone(): Build {
    const copy = new Build(this.#catalog);
    for (const [id, rank] of this.#perkRanks) copy.#perkRanks.set(id, rank);
    for (const [id, rank] of this.#abilityRanks) copy.#abilityRanks.set(id, rank);
    for (const [tree, id] of this.#ultimates) copy.#ultimates.set(tree, id);
    for (const [tree, slots] of this.#slots) copy.#slots.set(tree, [...slots]);
    copy.#quickslots.day = [...this.#quickslots.day];
    copy.#quickslots.night = [...this.#quickslots.night];
    return copy;
  }

  // --- Perks

  rank(perk: Perk): number {
    return this.#perkRanks.get(perk.id) ?? 0;
  }

  // The line above leads from a perk that has a rank, or there is no line.
  isOpen(perk: Perk): boolean {
    return perk.requires === null || this.rank(perk.requires) > 0;
  }

  canAddRank(perk: Perk): boolean {
    return this.isOpen(perk) && this.rank(perk) < perk.ranks.length;
  }

  addRank(perk: Perk): void {
    if (!this.canAddRank(perk)) return;
    this.#perkRanks.set(perk.id, this.rank(perk) + 1);
  }

  // Taking back the first rank also takes back every perk below it on the tree.
  removeRank(perk: Perk): void {
    const rank = this.rank(perk);
    if (rank === 0) return;
    if (rank === 1) this.#perkRanks.delete(perk.id);
    else this.#perkRanks.set(perk.id, rank - 1);
    this.#normalize();
  }

  // --- Ultimate Perks

  ultimate(tree: TreeId): Ultimate | null {
    const id = this.#ultimates.get(tree);
    return id === undefined ? null : this.#catalog.ultimate(id);
  }

  // Points still to spend on the tree's perks before its ultimates open, or 0 when Corruption gates
  // them. Abilities do not count.
  pointsToUltimate(tree: TreeId): number {
    const needed = this.#catalog.tree(tree).ultimatePoints;
    if (needed === null) return 0;
    return Math.max(0, needed - this.#perkSpending(tree).skillPoints);
  }

  canTakeUltimate(ultimate: Ultimate): boolean {
    const taken = this.ultimate(ultimate.tree);
    return (
      (taken === null || taken.id === ultimate.id) && this.pointsToUltimate(ultimate.tree) === 0
    );
  }

  // One Ultimate Perk per tree: taking another one is not allowed while one is learned.
  takeUltimate(ultimate: Ultimate): void {
    if (!this.canTakeUltimate(ultimate)) return;
    this.#ultimates.set(ultimate.tree, ultimate.id);
  }

  dropUltimate(tree: TreeId): void {
    this.#ultimates.delete(tree);
  }

  // --- Abilities

  abilityRank(ability: Ability): number {
    return this.#abilityRanks.get(ability.id) ?? 0;
  }

  canAddAbilityRank(ability: Ability): boolean {
    return this.abilityRank(ability) < ability.ranks.length;
  }

  // The ranks the story grants cannot be taken back.
  canRemoveAbilityRank(ability: Ability): boolean {
    return this.abilityRank(ability) > ability.granted;
  }

  addAbilityRank(ability: Ability): void {
    if (!this.canAddAbilityRank(ability)) return;
    this.#abilityRanks.set(ability.id, this.abilityRank(ability) + 1);
  }

  removeAbilityRank(ability: Ability): void {
    if (!this.canRemoveAbilityRank(ability)) return;
    const rank = this.abilityRank(ability) - 1;
    if (rank === 0) this.#abilityRanks.delete(ability.id);
    else this.#abilityRanks.set(ability.id, rank);
    this.#normalize();
  }

  // --- The ability wheel

  slotCount(tree: TreeId): number {
    return this.#catalog.wheel.baseSlots + this.rank(this.#catalog.tree(tree).slotPerk);
  }

  slotAt(tree: TreeId, index: number): Ability | null {
    const id = this.#slots.get(tree)?.[index] ?? null;
    return id === null ? null : this.#catalog.ability(id);
  }

  // Slotless abilities work as soon as they are learned and never take a slot.
  isSlotted(ability: Ability): boolean {
    if (ability.kind === 'slotless') return this.abilityRank(ability) > 0;
    return this.#slots.get(ability.tree)?.includes(ability.id) ?? false;
  }

  canSlot(ability: Ability, index: number): boolean {
    return (
      ability.kind !== 'slotless' &&
      this.abilityRank(ability) > 0 &&
      Number.isInteger(index) &&
      index >= 0 &&
      index < this.slotCount(ability.tree)
    );
  }

  // Puts an ability in a slot of its tree, moving it there if it already sits in another one.
  slot(ability: Ability, index: number): void {
    if (!this.canSlot(ability, index)) return;
    const slots = this.#treeSlots(ability.tree);
    const from = slots.indexOf(ability.id);
    if (from >= 0) slots[from] = slots[index] ?? null;
    slots[index] = ability.id;
    this.#normalize();
  }

  unslot(tree: TreeId, index: number): void {
    const slots = this.#treeSlots(tree);
    if (index < 0 || index >= slots.length) return;
    slots[index] = null;
    this.#normalize();
  }

  activationCharges(): number {
    const rank = this.rank(this.#catalog.chargePerk);
    return rank === 0
      ? this.#catalog.wheel.baseCharges
      : (this.#catalog.wheel.chargesByRank[rank - 1] ?? 0);
  }

  // --- Quickslots

  quickslotAt(set: QuickslotSet, index: number): Ability | null {
    const id = this.#quickslots[set][index] ?? null;
    return id === null ? null : this.#catalog.ability(id);
  }

  // The active abilities on the wheel that the set's form can use.
  quickslotChoices(set: QuickslotSet): readonly Ability[] {
    return this.#catalog.abilities.filter(
      (ability) =>
        ability.kind === 'active' &&
        QUICKSLOT_TREES[set].includes(ability.tree) &&
        this.isSlotted(ability),
    );
  }

  canQuickslot(set: QuickslotSet, index: number, ability: Ability): boolean {
    return (
      index >= 0 &&
      index < this.#catalog.wheel.quickslots &&
      this.quickslotChoices(set).some((choice) => choice.id === ability.id)
    );
  }

  // An ability sits on one quickslot of a set at most, so setting it again moves it.
  setQuickslot(set: QuickslotSet, index: number, ability: Ability | null): void {
    const slots = this.#quickslots[set];
    if (index < 0 || index >= slots.length) return;
    if (ability === null) {
      slots[index] = null;
      return;
    }
    if (!this.canQuickslot(set, index, ability)) return;
    const from = slots.indexOf(ability.id);
    if (from >= 0) slots[from] = slots[index] ?? null;
    slots[index] = ability.id;
  }

  // --- Totals

  treeSpending(tree: TreeId): Spending {
    const ultimate = this.ultimate(tree);
    const spent = this.#treeSpendingWithoutUltimate(tree);
    return ultimate === null ? spent : combine(spent, ultimate.cost);
  }

  spending(): Spending {
    return this.#catalog.trees.map((tree) => this.treeSpending(tree.id)).reduce(combine, NOTHING);
  }

  // Nothing beyond what the story grants: no ranks bought, nothing on the wheel or the quickslots.
  isEmpty(): boolean {
    const placed = [...this.#slots.values(), this.#quickslots.day, this.#quickslots.night].flat();
    return (
      this.#perkRanks.size === 0 &&
      this.#ultimates.size === 0 &&
      this.#catalog.abilities.every((ability) => this.abilityRank(ability) === ability.granted) &&
      placed.every((id) => id === null)
    );
  }

  resetTree(tree: TreeId): void {
    const own = this.#catalog.tree(tree);
    for (const perk of own.perks) this.#perkRanks.delete(perk.id);
    for (const ability of own.abilities) {
      if (ability.granted > 0) this.#abilityRanks.set(ability.id, ability.granted);
      else this.#abilityRanks.delete(ability.id);
    }
    this.#ultimates.delete(tree);
    this.#slots.set(tree, this.#emptySlots());
    this.#normalize();
  }

  #perkSpending(tree: TreeId): Spending {
    return this.#catalog
      .tree(tree)
      .perks.map((perk) => sum(perk.ranks, 0, this.rank(perk)))
      .reduce(combine, NOTHING);
  }

  #treeSpendingWithoutUltimate(tree: TreeId): Spending {
    // The ranks the story grants cost nothing.
    const abilities = this.#catalog
      .tree(tree)
      .abilities.map((ability) => sum(ability.ranks, ability.granted, this.abilityRank(ability)));
    return [this.#perkSpending(tree), ...abilities].reduce(combine, NOTHING);
  }

  #emptySlots(): (AbilityId | null)[] {
    const most =
      this.#catalog.wheel.baseSlots +
      Math.max(...this.#catalog.trees.map((t) => t.slotPerk.ranks.length));
    return Array<AbilityId | null>(most).fill(null);
  }

  #treeSlots(tree: TreeId): (AbilityId | null)[] {
    const slots = this.#slots.get(tree);
    if (slots === undefined) throw new Error(`No slots for the tree "${tree}"`);
    return slots;
  }

  // Takes back whatever a change has left without its requirement, until nothing changes.
  #normalize(): void {
    for (let changed = true; changed;) {
      changed = false;
      for (const perk of this.#catalog.perks) {
        if (this.rank(perk) > 0 && !this.isOpen(perk)) {
          this.#perkRanks.delete(perk.id);
          changed = true;
        }
      }
    }
    for (const tree of this.#catalog.trees) {
      const taken = this.ultimate(tree.id);
      if (taken !== null && this.pointsToUltimate(tree.id) > 0) this.#ultimates.delete(tree.id);
      const slots = this.#treeSlots(tree.id);
      const count = this.slotCount(tree.id);
      slots.forEach((id, index) => {
        if (id !== null && (index >= count || this.abilityRank(this.#catalog.ability(id)) === 0)) {
          slots[index] = null;
        }
      });
    }
    for (const set of ['day', 'night'] as const) {
      const choices = new Set(this.quickslotChoices(set).map((ability) => ability.id));
      this.#quickslots[set] = this.#quickslots[set].map((id) =>
        id !== null && choices.has(id) ? id : null,
      );
    }
  }
}
