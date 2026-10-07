import type { JSX } from 'react';

// A circle with a point at each quarter, the frame of perks and of active abilities in the game.
const ROSETTE =
  'M0,-39 L9,-29 A30,30 0 0 1 29,-9 L39,0 L29,9 A30,30 0 0 1 9,29 L0,39 L-9,29 A30,30 0 0 1 -29,9 L-39,0 L-29,-9 A30,30 0 0 1 -9,-29 Z';

type NodeFrameProps = {
  // Passive abilities sit in a plain disc instead of the pointed frame.
  readonly shape: 'rosette' | 'disc';
};

export function NodeFrame({ shape }: NodeFrameProps): JSX.Element {
  return (
    <svg className="frame" viewBox="-41 -41 82 82" aria-hidden="true">
      {shape === 'rosette' ? (
        <path className="frame-edge" d={ROSETTE} />
      ) : (
        <circle className="frame-edge" r="33" />
      )}
      <circle className="frame-inner" r={shape === 'rosette' ? 25 : 28} />
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
