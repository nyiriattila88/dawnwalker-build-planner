import type { JSX } from 'react';
import type { BuildView } from '../build/build';
import type { Perk } from '../catalog/catalog';
import { perkIconUrl } from './asset-urls';
import { toView } from './geometry';
import { ManualMark, NodeFrame } from './node-frame';
import { RankPips } from './rank-pips';
import { useNodeControls } from './use-node-controls';

type PerkNodeProps = {
  readonly perk: Perk;
  readonly build: BuildView;
  readonly selected: boolean;
  readonly onGive: () => void;
  readonly onTakeBack: () => void;
  readonly onShow: () => void;
};

// A perk on the tree: lit once learned, bright while it can be learned, dim while the perk above
// it has no rank.
export function PerkNode({
  perk,
  build,
  selected,
  onGive,
  onTakeBack,
  onShow,
}: PerkNodeProps): JSX.Element {
  const controls = useNodeControls(onGive, onTakeBack);
  const rank = build.rank(perk);
  const locked = !build.isOpen(perk);
  const state = rank > 0 ? 'learned' : locked ? 'locked' : 'open';
  const [left, top] = toView(perk.position);
  return (
    <button
      type="button"
      className={`node perk ${state}${selected ? ' selected' : ''}`}
      style={{ left, top }}
      aria-label={`${perk.name}, rank ${rank} of ${perk.ranks.length}`}
      onMouseEnter={onShow}
      onFocus={onShow}
      {...controls}
    >
      <NodeFrame shape="rosette" />
      <img className="glyph" src={perkIconUrl(perk.id)} alt="" draggable={false} />
      {perk.manual && rank < perk.ranks.length && <ManualMark />}
      <RankPips rank={rank} ranks={perk.ranks.length} locked={locked} />
    </button>
  );
}
