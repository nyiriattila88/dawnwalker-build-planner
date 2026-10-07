import type { JSX } from 'react';
import type { Ability } from '../catalog/catalog';
import { AbilityIcon } from './ability-icon';

type ChoiceListProps = {
  readonly title: string;
  readonly choices: readonly Ability[];
  readonly held: Ability | null;
  // Shown when nothing can go in: what would have to be learned or slotted first.
  readonly none: string;
  readonly onPick: (ability: Ability | null) => void;
  readonly onClose: () => void;
  readonly onShow: (ability: Ability) => void;
};

// What a wheel slot or a quickslot can take, opened by clicking it.
export function ChoiceList({
  title,
  choices,
  held,
  none,
  onPick,
  onClose,
  onShow,
}: ChoiceListProps): JSX.Element {
  return (
    <section className="choice-list" aria-label={title}>
      <header>
        <b>{title}</b>
        <span>
          {held !== null && (
            <button
              type="button"
              onClick={() => {
                onPick(null);
              }}
            >
              Empty it
            </button>
          )}
          <button type="button" onClick={onClose}>
            Close
          </button>
        </span>
      </header>
      {choices.length === 0 ? (
        <p className="choice-none">{none}</p>
      ) : (
        <div className="choices">
          {choices.map((ability) => (
            <button
              key={ability.id}
              type="button"
              className={held?.id === ability.id ? 'active' : undefined}
              aria-pressed={held?.id === ability.id}
              onClick={() => {
                onPick(ability);
              }}
              onMouseEnter={() => {
                onShow(ability);
              }}
              onFocus={() => {
                onShow(ability);
              }}
            >
              <AbilityIcon ability={ability} />
              {ability.name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
