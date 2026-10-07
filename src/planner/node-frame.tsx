import type { JSX } from 'react';

// A circle with a cusped tip on each axis, the shape of perks and of active abilities in the game.
function rosette(radius: number, tip: number, spread: number): string {
  const at = (r: number, degrees: number): string => {
    const angle = (degrees * Math.PI) / 180;
    return `${(r * Math.cos(angle)).toFixed(2)},${(r * Math.sin(angle)).toFixed(2)}`;
  };
  const pull = spread * 0.35;
  let path = `M${at(tip, -90)}`;
  for (const axis of [-90, 0, 90, 180]) {
    path += `Q${at(radius, axis + pull)} ${at(radius, axis + spread)}`;
    path += `A${String(radius)},${String(radius)} 0 0 1 ${at(radius, axis + 90 - spread)}`;
    path += `Q${at(radius, axis + 90 - pull)} ${at(tip, axis + 90)}`;
  }
  return `${path}Z`;
}

// Measured on the game's 1080p screen: a dark plate with long tips under a ring with short ones.
const PLATE = rosette(31, 37.5, 17);
const RING = rosette(26.5, 30.5, 12);

type NodeFrameProps = {
  // Passive abilities sit in plain circles instead of the pointed frame.
  readonly shape: 'rosette' | 'disc';
};

export function NodeFrame({ shape }: NodeFrameProps): JSX.Element {
  return (
    <svg className="frame" viewBox="-41 -41 82 82" aria-hidden="true">
      {shape === 'rosette' ? (
        <>
          <path className="frame-plate" d={PLATE} />
          <path className="frame-edge" d={RING} />
        </>
      ) : (
        <>
          <circle className="frame-plate" r="30.5" />
          <circle className="frame-edge" r="27" />
        </>
      )}
    </svg>
  );
}

// The book the game puts on a node whose manual has to be read first.
export function ManualMark(): JSX.Element {
  return (
    <svg className="manual" viewBox="0 0 24 18" aria-hidden="true">
      <path d="M1 2.5c3.5-1.6 7-1.4 10.5.6v13.2C8 14.3 4.5 14.1 1 15.7Z" />
      <path d="M23 2.5c-3.5-1.6-7-1.4-10.5.6v13.2c3.5-2 7-2.2 10.5-.6Z" />
    </svg>
  );
}
