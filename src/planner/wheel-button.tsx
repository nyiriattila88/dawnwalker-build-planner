import type { CSSProperties, JSX, KeyboardEvent } from 'react';
import type { Ability } from '../catalog/catalog';
import { AbilityIcon } from './ability-icon';
import { NodeFrame } from './node-frame';

type WheelButtonProps = {
  readonly held: Ability | null;
  readonly label: string;
  readonly className: string;
  readonly style?: CSSProperties;
  readonly open: boolean;
  readonly locked: boolean;
  readonly onOpen: () => void;
  readonly onEmpty: () => void;
  readonly onShow: (ability: Ability) => void;
};

// A slot of the wheel or a quickslot: a click opens what it can take, a right-click, Delete or
// Backspace empties it.
export function WheelButton({
  held,
  label,
  className,
  style,
  open,
  locked,
  onOpen,
  onEmpty,
  onShow,
}: WheelButtonProps): JSX.Element {
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    event.preventDefault();
    onEmpty();
  };
  return (
    <button
      type="button"
      className={`wheel-button ${className}${open ? ' open' : ''}${locked ? ' locked' : ''}`}
      style={style}
      aria-label={held === null ? label : `${held.name} in ${label}`}
      aria-expanded={open}
      disabled={locked}
      onClick={onOpen}
      onContextMenu={(event) => {
        event.preventDefault();
        onEmpty();
      }}
      onKeyDown={onKeyDown}
      onMouseEnter={() => {
        if (held !== null) onShow(held);
      }}
    >
      {held === null ? (
        <span className="ability-icon empty">
          <NodeFrame shape="rosette" />
        </span>
      ) : (
        <AbilityIcon ability={held} />
      )}
    </button>
  );
}
