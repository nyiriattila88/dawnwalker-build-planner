import type { JSX } from 'react';
import type { Ability } from '../catalog/catalog';
import { abilityIconUrl } from './asset-urls';
import { NodeFrame } from './node-frame';

type AbilityIconProps = {
  readonly ability: Ability;
};

// An ability's glyph in the frame and colour of its tree, as the wheel and the quickslots show it.
export function AbilityIcon({ ability }: AbilityIconProps): JSX.Element {
  return (
    <span className={`ability-icon ${ability.kind} tree-${ability.tree}`}>
      <NodeFrame shape={ability.kind === 'passive' ? 'disc' : 'rosette'} />
      <img className="glyph" src={abilityIconUrl(ability.id)} alt="" draggable={false} />
    </span>
  );
}
