import type { TreeId } from '../data/trees';

// The ability wheel as the game lays it out, in degrees clockwise from the right: Swordmastery
// across the top, Witchcraft down the left, Vampirism down the right, and the abilities that take
// no slot along the bottom. Measured on a photo of the Active Abilities screen.
export const WHEEL = { size: 760, radius: 318 } as const;

export const SLOT_ANGLES: Readonly<Record<TreeId, readonly number[]>> = {
  swordmastery: [-122, -101, -80, -59],
  witchcraft: [213, 194, 175, 156],
  vampirism: [-35, -15, 5, 24],
};

export const SLOTLESS_ANGLES: Readonly<Record<TreeId, readonly number[]>> = {
  swordmastery: [],
  witchcraft: [137, 119, 101],
  vampirism: [43, 61, 79],
};

// The centre of a slot at an angle, in pixels from the top left of the wheel.
export const onWheel = (
  degrees: number,
  radius: number = WHEEL.radius,
): { left: number; top: number } => {
  const radians = (degrees * Math.PI) / 180;
  return {
    left: WHEEL.size / 2 + radius * Math.cos(radians),
    top: WHEEL.size / 2 + radius * Math.sin(radians),
  };
};

// The directional quickslots: up, left, right, down.
export const QUICKSLOT_PLACES = ['up', 'left', 'right', 'down'] as const;
