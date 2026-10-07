export type TreeId = 'witchcraft' | 'swordmastery' | 'vampirism';

// When an effect applies: in human form by day, in vampire form by night, or in both.
export type Timing = 'day' | 'night' | 'anytime';

export type TreeData = {
  readonly id: TreeId;
  readonly name: string;
  readonly timing: Timing;
  // Skill points to spend in the tree before an Ultimate Perk opens, or null when Corruption gates it.
  readonly ultimatePoints: number | null;
};

// In the order of the tabs on the character screen.
export const TREES = [
  { id: 'witchcraft', name: 'Witchcraft', timing: 'day', ultimatePoints: 35 },
  { id: 'swordmastery', name: 'Swordmastery', timing: 'anytime', ultimatePoints: 35 },
  { id: 'vampirism', name: 'Vampirism', timing: 'night', ultimatePoints: null },
] as const satisfies readonly TreeData[];
