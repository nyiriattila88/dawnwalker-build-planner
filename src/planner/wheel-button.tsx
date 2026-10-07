import type { CSSProperties, DragEvent, JSX, KeyboardEvent } from 'react';
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
  // The key a drag finds this slot by, and whether a dragged ability would land on it now.
  readonly dropKey: string;
  readonly dropOver: boolean;
  readonly onOpen: () => void;
  readonly onEmpty: () => void;
  readonly onShow: (ability: Ability) => void;
  // Picks up the ability the slot holds.
  readonly onDragStart: (event: DragEvent) => void;
};

// A slot of the wheel or a quickslot: a click opens what it can take, a right-click, Delete or
// Backspace empties it, and what it holds can be dragged to another slot or off it.
export function WheelButton({
  held,
  label,
  className,
  style,
  open,
  locked,
  dropKey,
  dropOver,
  onOpen,
  onEmpty,
  onShow,
  onDragStart,
}: WheelButtonProps): JSX.Element {
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    event.preventDefault();
    onEmpty();
  };
  return (
    <button
      type="button"
      className={`wheel-button ${className}${open ? ' open' : ''}${locked ? ' locked' : ''}${dropOver ? ' drop-over' : ''}`}
      style={style}
      data-drop={dropKey}
      draggable={held !== null}
      aria-label={held === null ? label : `${held.name} in ${label}`}
      aria-expanded={open}
      disabled={locked}
      onClick={onOpen}
      onContextMenu={(event) => {
        event.preventDefault();
        onEmpty();
      }}
      onKeyDown={onKeyDown}
      onDragStart={held === null ? undefined : onDragStart}
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
