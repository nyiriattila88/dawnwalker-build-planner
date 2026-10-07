import type { JSX } from 'react';
import type { BuildView } from '../build/build';
import type { Ultimate } from '../catalog/catalog';
import { perkIconUrl } from './asset-urls';
import { toView, ULTIMATE_ROW } from './geometry';
import { NodeFrame } from './node-frame';
import { RankPips } from './rank-pips';
import { useNodeControls } from './use-node-controls';

type UltimateNodeProps = {
  readonly ultimate: Ultimate;
  readonly build: BuildView;
  readonly selected: boolean;
  readonly onTake: () => void;
  readonly onDrop: () => void;
  readonly onShow: () => void;
};

// An Ultimate Perk: lit once taken, dim while its tree has not spent enough, and closed for good
// once another ultimate of the tree is taken.
export function UltimateNode({
  ultimate,
  build,
  selected,
  onTake,
  onDrop,
  onShow,
}: UltimateNodeProps): JSX.Element {
  const controls = useNodeControls(onTake, onDrop);
  const taken = build.ultimate(ultimate.tree);
  const state =
    taken?.id === ultimate.id
      ? 'learned'
      : taken !== null
        ? 'closed'
        : build.canTakeUltimate(ultimate)
          ? 'open'
          : 'locked';
  const [left, top] = toView([ULTIMATE_ROW.x[ultimate.column], ULTIMATE_ROW.y]);
  return (
    <button
      type="button"
      className={`node ultimate ${state}${selected ? ' selected' : ''}`}
      style={{ left, top }}
      aria-label={`${ultimate.name}, Ultimate Perk, ${state === 'learned' ? 'learned' : 'not learned'}`}
      onMouseEnter={onShow}
      onFocus={onShow}
      {...controls}
    >
      <NodeFrame shape="rosette" />
      <img className="glyph" src={perkIconUrl(ultimate.id)} alt="" draggable={false} />
      <RankPips
        rank={state === 'learned' ? 1 : 0}
        ranks={1}
        locked={state !== 'open' && state !== 'learned'}
      />
    </button>
  );
}
