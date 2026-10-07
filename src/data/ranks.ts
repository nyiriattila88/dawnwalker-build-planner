// What learning one rank takes at a shrine: skill points and segments of the thirty day clock.
export type CostData = {
  readonly skillPoints: number;
  readonly time: number;
  // Not read from the game's own screen but taken from the pattern of the costs that were.
  readonly estimated: boolean;
};

export type RankData = {
  // The effect the rank adds, in the game's own words.
  readonly effect: string;
  readonly cost: CostData;
};
