import type { JSX } from 'react';
import type { BuildView } from '../build/build';
import type { Ability } from '../catalog/catalog';
import { abilityIconUrl } from './asset-urls';
import { abilityPosition, toView } from './geometry';
import { ManualMark, NodeFrame } from './node-frame';
import { RankPips } from './rank-pips';
import { useNodeControls } from './use-node-controls';

type AbilityNodeProps = {
  readonly ability: Ability;
  readonly build: BuildView;
  readonly selected: boolean;
  readonly onGive: () => void;
  readonly onTakeBack: () => void;
  readonly onShow: () => void;
};

// An ability on the grid beside the perks, in the colour of its tree: a pointed frame for an active
// one, a disc for a passive one.
export function AbilityNode({
  ability,
  build,
  selected,
  onGive,
  onTakeBack,
  onShow,
}: AbilityNodeProps): JSX.Element {
  const controls = useNodeControls(onGive, onTakeBack);
  const rank = build.abilityRank(ability);
  const [left, top] = toView(abilityPosition(ability.cell));
  return (
    <button
      type="button"
      className={`node ability ${ability.kind} ${rank > 0 ? 'learned' : 'open'}${selected ? ' selected' : ''}`}
      style={{ left, top }}
      aria-label={`${ability.name}, rank ${rank} of ${ability.ranks.length}`}
      onMouseEnter={onShow}
      onFocus={onShow}
      {...controls}
    >
      <NodeFrame shape={ability.kind === 'passive' ? 'disc' : 'rosette'} />
      <img className="glyph" src={abilityIconUrl(ability.id)} alt="" draggable={false} />
      {ability.manual && rank < ability.ranks.length && <ManualMark />}
      <RankPips rank={rank} ranks={ability.ranks.length} locked={false} />
    </button>
  );
}
