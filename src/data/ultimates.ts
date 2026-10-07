import type { CostData } from './ranks';
import type { TreeId } from './trees';

export type UltimateData = {
  readonly id: string;
  readonly name: string;
  readonly tree: TreeId;
  readonly description: string;
  readonly cost: CostData;
  // Left to right on the Ultimate Perks line of the tree.
  readonly column: 0 | 1 | 2;
};

// Generated from the Gamer Guides database text and the layout of the character screen, see
// docs/data.md. Codes walk this order, so an entry is never moved or removed.
export const ULTIMATES = [
  {
    id: 'entwined-torment',
    name: 'Entwined Torment',
    tree: 'witchcraft',
    description: 'First Witchcraft Ability used in combat targets 2 enemies.',
    cost: { skillPoints: 4, time: 2, estimated: true },
    column: 0,
  },
  {
    id: 'runic-bulwark',
    name: 'Runic Bulwark',
    tree: 'witchcraft',
    description: '15% chance to apply a random Hex to the opponent on a Perfect Block.',
    cost: { skillPoints: 4, time: 2, estimated: true },
    column: 1,
  },
  {
    id: 'aether-cascade',
    name: 'Aether Cascade',
    tree: 'witchcraft',
    description:
      '+20% Witchcraft Ability Damage for each Witchcraft Ability used.\nUp to 100% Witchcraft Ability Damage.\nResets after combat.',
    cost: { skillPoints: 4, time: 2, estimated: true },
    column: 2,
  },
  {
    id: 'last-stand',
    name: 'Last Stand',
    tree: 'swordmastery',
    description: '+100% Weapon Damage when Health is below 30%.',
    cost: { skillPoints: 4, time: 2, estimated: true },
    column: 0,
  },
  {
    id: 'sword-sage',
    name: 'Sword Sage',
    tree: 'swordmastery',
    description: 'Reset Active Ability Cooldowns on enemy killing.',
    cost: { skillPoints: 4, time: 2, estimated: true },
    column: 1,
  },
  {
    id: 'tactical-mastery',
    name: 'Tactical Mastery',
    tree: 'swordmastery',
    description: '-1 Activation Charge cost to all Active Abilities (minimum 1).',
    cost: { skillPoints: 4, time: 2, estimated: true },
    column: 2,
  },
  {
    id: 'renounce-death',
    name: 'Renounce Death',
    tree: 'vampirism',
    description:
      'Gain Lifesteal on Attacks and Immortality instead of dying once per combat. Duration 10s.',
    cost: { skillPoints: 4, time: 2, estimated: true },
    column: 0,
  },
  {
    id: 'lethal-crescendo',
    name: 'Lethal Crescendo',
    tree: 'vampirism',
    description:
      '+20% Claw Damage after killing an enemy or depleting a Health Segment of a Boss.\nCan stack.\nResets at the end of combat.',
    cost: { skillPoints: 4, time: 2, estimated: true },
    column: 1,
  },
  {
    id: 'sanguine-renewal',
    name: 'Sanguine Renewal',
    tree: 'vampirism',
    description: 'Voracious Bite resets all Active Abilities Cooldowns.',
    cost: { skillPoints: 4, time: 2, estimated: false },
    column: 2,
  },
] as const satisfies readonly UltimateData[];

export type UltimateId = (typeof ULTIMATES)[number]['id'];
