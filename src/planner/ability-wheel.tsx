import { useState, type JSX } from 'react';
import type { Build, BuildView, QuickslotSet } from '../build/build';
import type { Ability, Catalog, Tree } from '../catalog/catalog';
import type { TreeId } from '../data/trees';
import { AbilityIcon } from './ability-icon';
import { ChoiceList } from './choice-list';
import { FitToWidth } from './fit-to-width';
import type { InfoTarget } from './info-target';
import { TreeEmblem } from './tree-emblem';
import { onWheel, QUICKSLOT_PLACES, SLOT_ANGLES, SLOTLESS_ANGLES, WHEEL } from './wheel-layout';
import { WheelButton } from './wheel-button';

type AbilityWheelProps = {
  readonly catalog: Catalog;
  readonly build: BuildView;
  readonly onChange: (change: (draft: Build) => void) => void;
  readonly onShow: (target: InfoTarget) => void;
};

type Picking =
  | { readonly kind: 'slot'; readonly tree: TreeId; readonly index: number }
  | { readonly kind: 'quickslot'; readonly set: QuickslotSet; readonly index: number };

const SET_NAMES: Readonly<Record<QuickslotSet, string>> = {
  day: 'Day quickslots',
  night: 'Night quickslots',
};

const place = (degrees: number, radius?: number) => {
  const { left, top } = onWheel(degrees, radius);
  return { left, top };
};

// The Active Abilities screen: the wheel with each tree's slots, the abilities that need no slot,
// the activation charges, and the day and night quickslots chosen from what is on the wheel.
export function AbilityWheel({ catalog, build, onChange, onShow }: AbilityWheelProps): JSX.Element {
  const [picking, setPicking] = useState<Picking | null>(null);
  const show = (ability: Ability): void => {
    onShow({ kind: 'ability', ability });
  };
  const learned = (tree: Tree) =>
    tree.abilities.filter((ability) => build.abilityRank(ability) > 0);

  // Slots a learned ability into the first free slot of its tree, or takes it off the wheel.
  const toggle = (ability: Ability): void => {
    onChange((draft) => {
      if (draft.isSlotted(ability)) {
        const count = draft.slotCount(ability.tree);
        for (let index = 0; index < count; index++) {
          if (draft.slotAt(ability.tree, index)?.id === ability.id)
            draft.unslot(ability.tree, index);
        }
        return;
      }
      for (let index = 0; index < draft.slotCount(ability.tree); index++) {
        if (draft.slotAt(ability.tree, index) === null) {
          draft.slot(ability, index);
          return;
        }
      }
    });
    show(ability);
  };

  const choice = (() => {
    if (picking === null) return null;
    if (picking.kind === 'slot') {
      const tree = catalog.tree(picking.tree);
      return {
        title: `${tree.name} slot ${picking.index + 1}`,
        choices: learned(tree).filter((ability) => ability.kind !== 'slotless'),
        held: build.slotAt(tree.id, picking.index),
        none: `Learn a ${tree.name} ability first: click it on the character screen.`,
        pick: (ability: Ability | null) => {
          onChange((draft) => {
            if (ability === null) draft.unslot(tree.id, picking.index);
            else draft.slot(ability, picking.index);
          });
        },
      };
    }
    return {
      title: `${SET_NAMES[picking.set]}, ${QUICKSLOT_PLACES[picking.index] ?? ''}`,
      choices: build.quickslotChoices(picking.set),
      held: build.quickslotAt(picking.set, picking.index),
      none: 'Slot an active ability on the wheel first.',
      pick: (ability: Ability | null) => {
        onChange((draft) => {
          draft.setQuickslot(picking.set, picking.index, ability);
        });
      },
    };
  })();

  return (
    <div className="wheel-screen">
      <section className="ability-list" aria-label="All abilities">
        <h3>All abilities</h3>
        {catalog.trees.map((tree) => (
          <div key={tree.id} className={`ability-group tree-${tree.id}`}>
            <h4>
              <TreeEmblem tree={tree.id} />
              {tree.name}
            </h4>
            <div className="ability-group-items">
              {learned(tree).length === 0 && <p className="choice-none">None learned yet.</p>}
              {learned(tree).map((ability) => (
                <button
                  key={ability.id}
                  type="button"
                  className={build.isSlotted(ability) ? 'slotted' : undefined}
                  aria-pressed={build.isSlotted(ability)}
                  aria-label={ability.name}
                  disabled={ability.kind === 'slotless'}
                  title={
                    ability.kind === 'slotless' ? `${ability.name} takes no slot` : ability.name
                  }
                  onClick={() => {
                    toggle(ability);
                  }}
                  onMouseEnter={() => {
                    show(ability);
                  }}
                >
                  <AbilityIcon ability={ability} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <FitToWidth width={WHEEL.size} height={WHEEL.size}>
        <div className="wheel" style={{ width: WHEEL.size, height: WHEEL.size }}>
          <div className="wheel-disc" aria-hidden="true" />
          <span className="wheel-name" style={place(-90, 150)}>
            <TreeEmblem tree="swordmastery" />
            Swordmastery
          </span>
          <span className="wheel-name" style={place(146, 175)}>
            <TreeEmblem tree="witchcraft" />
            Witchcraft
          </span>
          <span className="wheel-name" style={place(34, 175)}>
            <TreeEmblem tree="vampirism" />
            Vampirism
          </span>
          <span
            className="charges"
            style={place(90, 200)}
            aria-label={`${build.activationCharges()} activation charges`}
          >
            {Array.from({ length: build.activationCharges() }, (_, index) => (
              <i key={index} />
            ))}
          </span>
          {catalog.trees.map((tree) =>
            SLOT_ANGLES[tree.id].map((angle, index) => (
              <WheelButton
                key={`${tree.id}-${index}`}
                held={build.slotAt(tree.id, index)}
                label={`${tree.name} slot ${index + 1}`}
                className={`slot tree-${tree.id}`}
                style={place(angle)}
                open={
                  picking?.kind === 'slot' && picking.tree === tree.id && picking.index === index
                }
                locked={index >= build.slotCount(tree.id)}
                onOpen={() => {
                  setPicking({ kind: 'slot', tree: tree.id, index });
                }}
                onEmpty={() => {
                  onChange((draft) => {
                    draft.unslot(tree.id, index);
                  });
                }}
                onShow={show}
              />
            )),
          )}
          {catalog.trees.map((tree) =>
            learned(tree)
              .filter((ability) => ability.kind === 'slotless')
              .map((ability, index) => (
                <span
                  key={ability.id}
                  className="wheel-fixed"
                  style={place(SLOTLESS_ANGLES[tree.id][index] ?? 90)}
                  title={`${ability.name} takes no slot`}
                  onMouseEnter={() => {
                    show(ability);
                  }}
                >
                  <AbilityIcon ability={ability} />
                </span>
              )),
          )}
        </div>
      </FitToWidth>

      <section className="quickslot-sets" aria-label="Quickslots">
        {(['day', 'night'] as const).map((set) => (
          <div key={set} className={`quickslot-set ${set}`}>
            <h4>{SET_NAMES[set]}</h4>
            <div className="pad">
              {QUICKSLOT_PLACES.map((where, index) => (
                <WheelButton
                  key={where}
                  held={build.quickslotAt(set, index)}
                  label={`${SET_NAMES[set]}, ${where}`}
                  className={`quickslot ${where}`}
                  open={
                    picking?.kind === 'quickslot' && picking.set === set && picking.index === index
                  }
                  locked={false}
                  onOpen={() => {
                    setPicking({ kind: 'quickslot', set, index });
                  }}
                  onEmpty={() => {
                    onChange((draft) => {
                      draft.setQuickslot(set, index, null);
                    });
                  }}
                  onShow={show}
                />
              ))}
            </div>
          </div>
        ))}
        {choice !== null && (
          <ChoiceList
            title={choice.title}
            choices={choice.choices}
            held={choice.held}
            none={choice.none}
            onPick={(ability) => {
              choice.pick(ability);
              setPicking(null);
            }}
            onClose={() => {
              setPicking(null);
            }}
            onShow={show}
          />
        )}
      </section>
    </div>
  );
}
