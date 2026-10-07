import type { RankData } from './ranks';
import type { TreeId } from './trees';

// An active ability is slotted and put on a quickslot, a passive one works once slotted, and a few
// take no slot at all.
type AbilityKind = 'active' | 'passive' | 'slotless';

export type AbilityData = {
  readonly id: string;
  readonly name: string;
  readonly tree: TreeId;
  readonly kind: AbilityKind;
  readonly description: string;
  readonly ranks: readonly RankData[];
  // Column and row on the two column Abilities grid of the tree.
  readonly cell: readonly [number, number];
  readonly manual: boolean;
  // Ranks the story grants without a shrine.
  readonly granted: number;
};

// Generated from the Gamer Guides database text and the layout of the character screen, see
// docs/data.md. Codes walk this order, so an entry is never moved or removed.
export const ABILITIES = [
  {
    id: 'compel-soul',
    name: 'Compel Soul',
    tree: 'witchcraft',
    kind: 'slotless',
    description:
      'Allows you to speak with restless souls. Use together with objects associated with the dead to obtain additional information. This Ability doesn’t take up a common slot in the Active Abilities panel.',
    ranks: [
      {
        effect: '-0.5% permanent Witchcraft Ability Cooldown for each soul compelled.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '-1% permanent Witchcraft Ability Cooldown for each soul compelled.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '-1.5% permanent Witchcraft Ability Cooldown for each soul compelled.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '-2% permanent Witchcraft Ability Cooldown for each soul compelled.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 0],
    manual: false,
    granted: 1,
  },
  {
    id: 'astral-communion',
    name: 'Astral Communion',
    tree: 'witchcraft',
    kind: 'slotless',
    description:
      'Activates dormant magic in places of power scattered throughout the Valley. This Ability doesn’t take up a common slot in the Active Abilities panel.',
    ranks: [
      {
        effect: '+0.4% permanent Witchcraft Ability Damage for each place of power exorcised.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+0.8% permanent Witchcraft Ability Damage for each place of power exorcised.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+1.2% permanent Witchcraft Ability Damage for each place of power exorcised.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+1.6% permanent Witchcraft Ability Damage for each place of power exorcised.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 0],
    manual: false,
    granted: 1,
  },
  {
    id: 'burning-blood',
    name: 'Burning Blood',
    tree: 'witchcraft',
    kind: 'active',
    description: 'Deals Damage over time to a target.',
    ranks: [
      {
        effect: 'Deals Damage per second. Duration 10s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Deals Damage per second. Duration 12s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Deals Damage per second.\nOn Death, effect transfers to different enemy. Duration 14s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Deals Damage per second.\nOn Death, effect transfers to different enemy. Duration 16s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 1],
    manual: true,
    granted: 1,
  },
  {
    id: 'soul-stigma',
    name: 'Soul Stigma',
    tree: 'witchcraft',
    kind: 'active',
    description: 'Higher Critical Chance and Critical Damage on target.',
    ranks: [
      {
        effect: '+35% Critical Hit chance.\n+10% Critical Damage. Duration 20s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+40% Critical Hit chance.\n+20% Critical Damage. Duration 25s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          '+45% Critical Hit chance.\n+30% Critical Damage.\nOn Death, effect transfers to different enemy. Duration 30s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          '+50% Critical Hit chance.\n+40% Critical Damage.\nOn Death, effect transfers to different enemy and Stuns him. Duration 35s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 3],
    manual: true,
    granted: 0,
  },
  {
    id: 'soul-reaping',
    name: 'Soul Reaping',
    tree: 'witchcraft',
    kind: 'active',
    description: 'Lifesteals target over time and keep him away.',
    ranks: [
      {
        effect: 'Lifesteal per second. Duration 18s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Lifesteal per second. Duration 24s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Lifesteal per second.\n20% Damage you receive transfers to the target. Duration 30s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Lifesteal per second.\n40% Damage you receive transfers to the target.\n500 Heal on target’s Death. Duration 36s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 2],
    manual: true,
    granted: 0,
  },
  {
    id: 'ravenous-flock',
    name: 'Ravenous Flock',
    tree: 'witchcraft',
    kind: 'active',
    description:
      'Area Attack and Stun on target. Attacking the target triggers additional Area Attacks.',
    ranks: [
      {
        effect:
          'Area Damage. Ravenous Flock cancels after 1 hit.\n100% Critical Hits on target. Duration 20s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Area Damage. Ravenous Flock cancels after 2 hits.\n100% Critical Hits on target. Duration 20s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Area Damage. Ravenous Flock cancels after 3 hits.\n100% Critical Hits on target. Duration 20s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Area Damage. Ravenous Flock cancels after 4 hits.\n100% Critical Hits on target. Duration 20s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 2],
    manual: true,
    granted: 0,
  },
  {
    id: 'life-lock',
    name: 'Life Lock',
    tree: 'witchcraft',
    kind: 'active',
    description: 'Blocks Damage and Reflects it back to the enemy.',
    ranks: [
      {
        effect: 'Reflects 100% of Damage. Blocks 2 instances of Damage. Duration 90s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Reflects 120% of Damage. Blocks 3 instances of Damage. Duration 90s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Reflects 160% of Damage. Blocks 3 instances of Damage. Duration 90s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Reflects 200% of Damage. Blocks 4 instances of Damage. Duration 90s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 1],
    manual: true,
    granted: 0,
  },
  {
    id: 'unholy-vitality',
    name: 'Unholy Vitality',
    tree: 'witchcraft',
    kind: 'passive',
    description:
      'Regenerates Health after using Active Abilities. This Ability works passively once equipped in the Active Abilities panel.',
    ranks: [
      {
        effect: 'Regenerates 10% of Health over 10 seconds.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Regenerates 15% of Health over 10 seconds.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Regenerates 20% Health. Heal 20% of dealt Damage from Critical Hits on enemies affected by Witchcraft Abilities.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Regenerates 25% Health. Heal 40% of dealt Damage from Critical Hits on enemies affected by Witchcraft Abilities.\nNo Health cost for using Witchcraft Abilities when Health is below 30%.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 3],
    manual: true,
    granted: 0,
  },
  {
    id: 'cycle-of-ruin',
    name: 'Cycle of Ruin',
    tree: 'witchcraft',
    kind: 'passive',
    description:
      'Extends Duration of currently active Witchcraft Abilities with each landed Attack, Block and Perfect Block. This Ability works passively once equipped in the Active Abilities panel.',
    ranks: [
      {
        effect: 'Extends Duration of Witchcraft Abilities by 1s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Extends Duration of Witchcraft Abilities by 2s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Extends Duration of Witchcraft Abilities by 2s. Critical Hits extend Duration of Witchcraft Abilities by 4s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Extends Duration of Witchcraft Abilities by 3s. Critical Hits extend Duration of Witchcraft Abilities by 5s.\n+10% Witchcraft Ability Damage for each enemy currently affected by Witchcraft Abilities.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 4],
    manual: true,
    granted: 0,
  },
  {
    id: 'mercurial-fervour',
    name: 'Mercurial Fervour',
    tree: 'witchcraft',
    kind: 'slotless',
    description:
      'Gain Haste in exploration by briefly slowing down the world around you. This Ability doesn’t take up a common slot in the Active Abilities panel.',
    ranks: [
      { effect: 'Gain Haste.', cost: { skillPoints: 1, time: 0, estimated: true } },
      {
        effect: 'Haste costs 50% less Stamina.',
        cost: { skillPoints: 1, time: 0, estimated: true },
      },
      {
        effect: 'Haste costs 50% less Stamina. Haste is 20% faster.',
        cost: { skillPoints: 1, time: 0, estimated: true },
      },
      {
        effect: 'Haste doesn’t cost Stamina. Haste is 20% faster.',
        cost: { skillPoints: 2, time: 0, estimated: true },
      },
    ],
    cell: [1, 4],
    manual: true,
    granted: 0,
  },
  {
    id: 'dirty-trick',
    name: 'Dirty Trick',
    tree: 'swordmastery',
    kind: 'active',
    description: 'Stuns and Damages a target and makes them vulnerable to Active Abilities.',
    ranks: [
      {
        effect:
          'Stun ends after 3 hits.\nDeals Damage.\n+10% Damage from Active Abilities. Duration 15s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Stun ends after 4 hits.\nDeals Damage.\n+20% Damage from Active Abilities. Duration 20s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Stuns in Area. Ends after 5 hits.\nDeals Damage.\n+30% Damage from Active Abilities. Duration 25s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Stuns in Area. Ends after 6 hits.\nDeals Damage.\n+50% Damage from Active Abilities. Duration 30s.\n-1 Activation Charge cost for Active Abilities used on Stunned enemies (minimum 1).',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 0],
    manual: true,
    granted: 1,
  },
  {
    id: 'broad-swing',
    name: 'Broad Swing',
    tree: 'swordmastery',
    kind: 'active',
    description: 'Weapon Area Attack.',
    ranks: [
      { effect: 'Deals 300% Weapon Damage.', cost: { skillPoints: 1, time: 1, estimated: true } },
      { effect: 'Deals 375% Weapon Damage.', cost: { skillPoints: 1, time: 1, estimated: true } },
      {
        effect:
          'Deals 450% Weapon Damage.\nFor each enemy you hit, increase Broad Swing Damage by 10%.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Deals 525% Weapon Damage.\nFor each enemy you hit, increase Broad Swing Damage by 10%.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 0],
    manual: true,
    granted: 0,
  },
  {
    id: 'charge',
    name: 'Charge',
    tree: 'swordmastery',
    kind: 'active',
    description: 'Charge dealing Damage and Stunning a target and everyone on your way.',
    ranks: [
      {
        effect: 'Deals 200% Attack Damage. Stun Duration 2s. Bleed on target: 50% chance.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Deals 250% Attack Damage. Stun Duration 2s. Bleed on target: 100% chance.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Deals 300% Attack Damage. Stun Duration 2s. Bleed on target: 100% chance.\n+66% Bleed Duration.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Deals 350% Attack Damage. Stun Duration 2s. Bleed on target: 100% chance.\n+66% Bleed Duration.\n1 Activation Charge restore on kill.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 1],
    manual: true,
    granted: 0,
  },
  {
    id: 'artery-strike',
    name: 'Artery Strike',
    tree: 'swordmastery',
    kind: 'active',
    description: 'Critical Attack with a chance of Decapitating the target.',
    ranks: [
      {
        effect: 'Deals 450% Weapon Damage. Decapitation : 10% chance.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Deals 560% Weapon Damage. Decapitation : 20% chance.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Deals 680% Weapon Damage. Decapitation : 35% chance.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Deals 800% Weapon Damage. Decapitation : 50% chance. Decapitation chance x2 on Bleeding enemies.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 1],
    manual: true,
    granted: 0,
  },
  {
    id: 'walking-fortress',
    name: 'Walking Fortress',
    tree: 'swordmastery',
    kind: 'passive',
    description:
      'Perfect Block restores portion of Activation Charge. This Ability works passively once equipped in the Active Abilities panel.',
    ranks: [
      {
        effect: 'Restores 10% of Activation Charge',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Restores 15% of Activation Charge\n-1s Cooldowns of Active Abilites after Directional Block or Perfect Block.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Restores 20% of Activation Charge\n-1s Cooldowns of Active Abilites after Directional Block or Perfect Block.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Restores 25% of Activation Charge\n-2s Cooldowns of Active Abilites after a Directional Block or a Perfect Block.\n-1 Activation Charge cost for the next Active Ability if used within 5s after a Perfect Block (minimum 1).',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 3],
    manual: true,
    granted: 0,
  },
  {
    id: 'swiftness',
    name: 'Swiftness',
    tree: 'swordmastery',
    kind: 'passive',
    description:
      'Boosts Attack Speed after Perfect Block. This Ability works passively once equipped in the Active Abilities panel.',
    ranks: [
      {
        effect: '+10% Attack Speed. Duration 6s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+15% Attack Speed. Duration 8s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+20% Attack Speed.\n+5% Critical Hit chance. Duration 10s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          '+30% Attack Speed.\n+5% Critical Hit chance. Critical Hits cost no Stamina. Duration 12s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 2],
    manual: true,
    granted: 0,
  },
  {
    id: 'adrenaline-rush',
    name: 'Adrenaline Rush',
    tree: 'swordmastery',
    kind: 'passive',
    description:
      'Increases Attack Damage after using Active Abilities. This Ability works passively once equipped in Active Ability panel.',
    ranks: [
      {
        effect: '+20% Attack Damage. Duration 6s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+30% Attack Damage.\n+50% passive Activation Charge Regeneration. Duration 6s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+40% Attack Damage.\n+100% passive Activation Charge Regeneration. Duration 6s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          '+50% Attack Damage.\n+150% passive Activation Charge Regeneration. Attacks restore 10% of Activation Charge Duration 6s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 2],
    manual: true,
    granted: 0,
  },
  {
    id: 'voracious-bite',
    name: 'Voracious Bite',
    tree: 'vampirism',
    kind: 'slotless',
    description:
      'Restores Health by drinking target’s blood. This Ability doesn’t take up a common slot in the Active Abilities panel.',
    ranks: [
      {
        effect: 'Restores 60% of Health Segment. Damage to target.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Restores 80% of Health Segment. Damage to target.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Restores 100% of Health Segment. Damage to target.\n+10% Claw Damage for 30s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Restores 120% of Health Segment. Damage to target.\n+25% Claw Damage for 60s.\nNo Cooldown if you kill the target.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 0],
    manual: false,
    granted: 1,
  },
  {
    id: 'shadowstorm',
    name: 'Shadowstorm',
    tree: 'vampirism',
    kind: 'active',
    description: 'Slows down Time around you.',
    ranks: [
      { effect: 'Duration 4s.', cost: { skillPoints: 1, time: 1, estimated: true } },
      { effect: 'Duration 5s.', cost: { skillPoints: 1, time: 1, estimated: true } },
      {
        effect: '+20% Attack Damage. Duration 6s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+25% Attack Damage.\nExtend Duration by 1s on enemy kill. Duration 7s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 0],
    manual: false,
    granted: 0,
  },
  {
    id: 'piercing-shriek',
    name: 'Piercing Shriek',
    tree: 'vampirism',
    kind: 'active',
    description:
      'Stuns all enemies in front of you, Weakens their Defence and Attack Damage. Blocking their attacks reflects Damage back at them.',
    ranks: [
      {
        effect:
          'Stun Duration 2s.\n+15% Damage to targets and -15% Damage dealt by targets. Block reflects 10% of Damage back to the attacker. Perfect Block reflects 40%. Duration 25s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Stun Duration 3s.\n+20% Damage to targets and -20% Damage dealt by targets. Block reflects 15% of Damage back to the attacker. Perfect Block reflects 60%. Duration 35s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Stun Duration 4s.\n+25% Damage to targets and -25% Damage dealt by targets. Block reflects 20% of Damage back to the attacker. Perfect Block reflects 80%. Duration 45s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Stun Duration 5s.\n+30% Damage to targets and -30% Damage dealt by targets. Block reflects 25% of Damage back to the attacker. Perfect Block reflects 100%.\nExtends the Duration of effects on attackers by %. Duration 60s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 1],
    manual: false,
    granted: 0,
  },
  {
    id: 'blood-surge',
    name: 'Blood Surge',
    tree: 'vampirism',
    kind: 'active',
    description: 'Explodes target. Bosses receive Damage instead.',
    ranks: [
      {
        effect: 'Area Damage in 3m radius after Explosion. Damage to Bosses.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Area Damage in 4m radius after Explosion. Damage to Bosses.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Area Damage in 5m radius after Explosion. Damage to Bosses.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Area Damage in 6m radius after Explosion. Damage to Bosses.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 1],
    manual: false,
    granted: 0,
  },
  {
    id: 'mesmerise',
    name: 'Mesmerise',
    tree: 'vampirism',
    kind: 'active',
    description:
      'Mind Control a target and force him to Fight on your side. Can’t be used on Bosses.',
    ranks: [
      { effect: 'Duration 25s.', cost: { skillPoints: 1, time: 1, estimated: true } },
      {
        effect: '+25% to target’s Damage. Duration 35s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '+50% to target’s Damage. Duration 45s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          '+75% to target’s Damage.\nTarget’s Attacks restore 20% of Activation Charge Duration 60s.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 2],
    manual: false,
    granted: 0,
  },
  {
    id: 'death-from-above',
    name: 'Death from Above',
    tree: 'vampirism',
    kind: 'slotless',
    description:
      'Instantly Kill a target below you. Bosses receive Damage instead. This Ability doesn’t take up a common slot in the Active Abilities panel.',
    ranks: [
      {
        effect: 'Damage to Bosses and Tough enemies',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Damage to Bosses and Tough enemies\n+20% Attack Damage for 15s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Damage to Bosses and Tough enemies\n+40% Attack Damage for 15s.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Damage to Bosses and Tough enemies\n+60% Attack Damage for 15s.\nRestores 1 Activation Charge.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 2],
    manual: false,
    granted: 0,
  },
  {
    id: 'scarlet-shield',
    name: 'Scarlet Shield',
    tree: 'vampirism',
    kind: 'passive',
    description:
      'Health Regeneration chance after Block. This Ability works passively once equipped in the Active Abilities panel.',
    ranks: [
      {
        effect:
          'Restore 20% of Health Segment after Perfect Block. 20% chance to also trigger after Directional Block and 10% chance after Omniblock.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Restore 25% of Health Segment after Perfect Block. 20% chance to also trigger after Directional Block and 15% chance after Omniblock.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Restore 25% of Health Segment after Perfect Block. 20% chance to also trigger after Directional Block and 20% chance after Omniblock. Attack after Perfect Block heals you for 10% of dealt Damage.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect:
          'Restore 30% of Health Segment after Perfect Block. 30% chance to also trigger after Directional Block and 25% chance after Omniblock. Attack after Perfect Block heals you for 10% of dealt Damage.\n25% chance for any Block to become Perfect Block.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 3],
    manual: false,
    granted: 0,
  },
  {
    id: 'crimson-rush',
    name: 'Crimson Rush',
    tree: 'vampirism',
    kind: 'passive',
    description:
      'Increases Damage of Active Abilities, the higher your Health percentage is. This Ability works passively once equipped in the Active Abilities panel.',
    ranks: [
      {
        effect: 'Up to ’+25% Active Ability Damage.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Up to ’+30% Active Ability Damage.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Up to ’+35% Active Ability Damage.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: 'Up to ’+40% Active Ability Damage.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [1, 3],
    manual: false,
    granted: 0,
  },
  {
    id: 'shred',
    name: 'Shred',
    tree: 'vampirism',
    kind: 'passive',
    description:
      'Bleed chance on your Weapon or Claw Attacks. This Ability works passively once equipped in the Active Abilities panel.',
    ranks: [
      { effect: '20% Bleed chance.', cost: { skillPoints: 1, time: 1, estimated: true } },
      {
        effect: '25% Bleed chance.\n+25% Bleed Damage.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '30% Bleed chance.\n+50% Bleed Damage.',
        cost: { skillPoints: 1, time: 1, estimated: true },
      },
      {
        effect: '35% Bleed chance.\n+100% Bleed Damage. Damage when Bleed is reapplied.',
        cost: { skillPoints: 2, time: 1, estimated: true },
      },
    ],
    cell: [0, 4],
    manual: false,
    granted: 0,
  },
  {
    id: 'shapeshift',
    name: 'Shapeshift',
    tree: 'vampirism',
    kind: 'slotless',
    description:
      'Shapeshift into a Wolf and gain Haste in exploration. This Ability doesn’t take up a common slot in the Active Abilities panel.',
    ranks: [
      { effect: 'Gain Haste.', cost: { skillPoints: 1, time: 0, estimated: true } },
      {
        effect: 'Haste costs 50% less Stamina.',
        cost: { skillPoints: 1, time: 0, estimated: true },
      },
      {
        effect: 'Haste costs 50% less Stamina. Haste is 20% faster.',
        cost: { skillPoints: 1, time: 0, estimated: true },
      },
      {
        effect: 'Haste doesn’t cost Stamina. Haste is 20% faster.',
        cost: { skillPoints: 2, time: 0, estimated: true },
      },
    ],
    cell: [1, 4],
    manual: false,
    granted: 0,
  },
] as const satisfies readonly AbilityData[];

export type AbilityId = (typeof ABILITIES)[number]['id'];
