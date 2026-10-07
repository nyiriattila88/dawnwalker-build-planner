import type { JSX } from 'react';

type RankPipsProps = {
  readonly rank: number;
  readonly ranks: number;
  // A locked node shows its ranks dimmed, as the game does.
  readonly locked: boolean;
};

// The diamonds under a node: a filled one for every rank learned, an open one for the rest.
export function RankPips({ rank, ranks, locked }: RankPipsProps): JSX.Element {
  return (
    <span className={locked ? 'pips locked' : 'pips'} aria-hidden="true">
      {Array.from({ length: ranks }, (_, index) => (
        <i key={index} className={index < rank ? 'lit' : undefined} />
      ))}
    </span>
  );
}
