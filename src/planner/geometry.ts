// The tree pane is laid out in the pixels of a 1920 by 1080 screenshot of the character screen, the
// way the data records its positions. The view is the part of that screen with the perks, the
// Ultimate Perks and the abilities, and FitToWidth scales it down on a narrow screen.
export const TREE_VIEW = { left: 150, top: 222, width: 1182, height: 762 } as const;

export const ULTIMATE_ROW = { y: 925, x: [372, 582, 792] } as const;
export const ABILITY_GRID = { x: [1111, 1254], y: [282, 443, 604, 766, 927] } as const;
// Where the labels above the perks and the abilities sit.
export const LABELS = { perks: [160, 236], abilities: [1140, 236], ultimates: [160, 862] } as const;

export const toView = ([x, y]: readonly [number, number]): readonly [number, number] => [
  x - TREE_VIEW.left,
  y - TREE_VIEW.top,
];

export const abilityPosition = ([column, row]: readonly [number, number]): readonly [
  number,
  number,
] => [ABILITY_GRID.x[column] ?? 0, ABILITY_GRID.y[row] ?? 0];
