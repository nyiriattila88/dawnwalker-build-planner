import type { CSSProperties, DragEvent, JSX, KeyboardEvent } from 'react';
import type { Ability } from '../catalog/catalog';
import { AbilityIcon } from './ability-icon';

type WheelButtonProps = {
  readonly held: Ability | null;
  // A slot of the wheel or a quickslot, which the game marks differently while they are empty.
  readonly kind: 'slot' | 'quickslot';
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

type Mark = 'open' | 'locked' | 'quickslot';

// What the game shows where nothing is held: a cross where an ability can go, a lock where the tree
// has no slot yet, and a circled cross on an empty quickslot.
function EmptyMark({ mark }: { readonly mark: Mark }): JSX.Element {
  return (
    <svg className={`slot-mark ${mark}`} viewBox="0 0 24 24" aria-hidden="true">
      {mark === 'locked' && (
        <>
          <path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" />
          <rect x="6" y="11" width="12" height="9" rx="1.5" />
        </>
      )}
      {mark === 'open' && <path d="M12 4.5v15M4.5 12h15" />}
      {mark === 'quickslot' && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v9M7.5 12h9" />
        </>
      )}
    </svg>
  );
}

// A slot of the wheel or a quickslot: a click opens what it can take, a right-click, Delete or
// Backspace empties it, and what it holds can be dragged to another slot or off it.
export function WheelButton({
  held,
  kind,
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
        <EmptyMark mark={locked ? 'locked' : kind === 'quickslot' ? 'quickslot' : 'open'} />
      ) : (
        <AbilityIcon ability={held} />
      )}
    </button>
  );
}
