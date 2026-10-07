import type { PerkId } from './perks';
import type { TreeId } from './trees';

export type AbilityWheelData = {
  // Slots each tree has on the wheel before its slot perk, which adds one per rank.
  readonly baseSlots: number;
  readonly slotPerks: Readonly<Record<TreeId, PerkId>>;
  // Activation charges before Sustained Focus, and the maximum at each of its ranks.
  readonly baseCharges: number;
  readonly chargePerk: PerkId;
  readonly chargesByRank: readonly number[];
  // The directional quickslots of the day set and of the night set.
  readonly quickslots: number;
};

export const ABILITY_WHEEL = {
  baseSlots: 1,
  slotPerks: {
    witchcraft: 'forbidden-sigils',
    swordmastery: 'master-fencer',
    vampirism: 'vrakhiri-might',
  },
  baseCharges: 1,
  chargePerk: 'sustained-focus',
  // Rank 2 starts each fight with a full charge instead of raising the maximum.
  chargesByRank: [2, 2, 3, 4],
  quickslots: 4,
} as const satisfies AbilityWheelData;
