import { useMemo, useState, type JSX, type ReactNode } from 'react';
import type { Build, BuildView, QuickslotSet } from '../build/build';
import type { Ability, Catalog, Tree } from '../catalog/catalog';
import { AbilityIcon } from './ability-icon';
import { stoneUrl } from './asset-urls';
import { ChoiceList } from './choice-list';
import { dropTargetKey, type DropTarget } from './drag-and-drop';
import { FitToWidth } from './fit-to-width';
import type { InfoTarget } from './info-target';
import { TreeEmblem } from './tree-emblem';
import { useDragAndDrop } from './use-drag-and-drop';
import { onWheel, QUICKSLOT_PLACES, SLOT_ANGLES, SLOTLESS_ANGLES, WHEEL } from './wheel-layout';
import { WheelButton } from './wheel-button';
import { WheelRunes, WheelSurround } from './wheel-runes';

type AbilityWheelProps = {
  readonly catalog: Catalog;
  readonly build: BuildView;
  readonly onChange: (change: (draft: Build) => void) => void;
  readonly onShow: (target: InfoTarget) => void;
  // The info panel, shown above the quickslots.
  readonly info: ReactNode;
};

const SET_NAMES: Readonly<Record<QuickslotSet, string>> = {
  day: 'Day quickslots',
  night: 'Night quickslots',
};

const place = (degrees: number, radius?: number) => {
  const { left, top } = onWheel(degrees, radius);
  return { left, top };
};

// The Active Abilities screen: the wheel with each tree's slots, the abilities that need no slot,
// the activation charges, and the day and night quickslots chosen from what is on the wheel. An
// ability is put on a slot by a click on the slot or by dragging it there.
export function AbilityWheel({
  catalog,
  build,
  onChange,
  onShow,
  info,
}: AbilityWheelProps): JSX.Element {
  const [picking, setPicking] = useState<DropTarget | null>(null);
  // Every slot and quickslot of the screen: the places a drag can end.
  const targets = useMemo(
    (): readonly DropTarget[] => [
      ...catalog.trees.flatMap((tree) =>
        SLOT_ANGLES[tree.id].map((_, index): DropTarget => ({
          kind: 'slot',
          tree: tree.id,
          index,
        })),
      ),
      ...(['day', 'night'] as const).flatMap((set) =>
        QUICKSLOT_PLACES.map((_, index): DropTarget => ({ kind: 'quickslot', set, index })),
      ),
    ],
    [catalog],
  );
  const drag = useDragAndDrop(build, targets, onChange);
  const isPicking = (target: DropTarget): boolean =>
    picking !== null && dropTargetKey(picking) === dropTargetKey(target);
  const charges = build.activationCharges();
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
      <div
        className="screen-art"
        aria-hidden="true"
        style={{ backgroundImage: `url("${stoneUrl}")` }}
      />
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
                  draggable={ability.kind !== 'slotless'}
                  title={
                    ability.kind === 'slotless' ? `${ability.name} takes no slot` : ability.name
                  }
                  onClick={() => {
                    toggle(ability);
                  }}
                  onMouseEnter={() => {
                    show(ability);
                  }}
                  onDragStart={(event) => {
                    drag.start({ ability, from: null }, event);
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
          <WheelSurround />
          <div className="wheel-disc" aria-hidden="true" />
          <WheelRunes />
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
            aria-label={`${charges} activation charge${charges === 1 ? '' : 's'}`}
          >
            {Array.from({ length: charges }, (_, index) => (
              <i key={index} />
            ))}
          </span>
          {catalog.trees.map((tree) =>
            SLOT_ANGLES[tree.id].map((angle, index) => {
              const target: DropTarget = { kind: 'slot', tree: tree.id, index };
              const held = build.slotAt(tree.id, index);
              return (
                <WheelButton
                  key={dropTargetKey(target)}
                  held={held}
                  kind="slot"
                  label={`${tree.name} slot ${index + 1}`}
                  className={`slot tree-${tree.id}`}
                  style={place(angle)}
                  open={isPicking(target)}
                  locked={index >= build.slotCount(tree.id)}
                  dropKey={dropTargetKey(target)}
                  dropOver={drag.overKey === dropTargetKey(target)}
                  onOpen={() => {
                    setPicking(target);
                  }}
                  onEmpty={() => {
                    onChange((draft) => {
                      draft.unslot(tree.id, index);
                    });
                  }}
                  onShow={show}
                  onDragStart={(event) => {
                    if (held !== null) drag.start({ ability: held, from: target }, event);
                  }}
                />
              );
            }),
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

      <div className="wheel-side">
        {info}
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

        <section className="quickslot-sets" aria-label="Quickslots">
          {(['day', 'night'] as const).map((set) => (
            <div key={set} className={`quickslot-set ${set}`}>
              <h4>
                <span className={set === 'day' ? 'sun' : 'moon'} aria-hidden="true" />
                {SET_NAMES[set]}
              </h4>
              <div className="pad">
                {QUICKSLOT_PLACES.map((where, index) => {
                  const target: DropTarget = { kind: 'quickslot', set, index };
                  const held = build.quickslotAt(set, index);
                  return (
                    <WheelButton
                      key={where}
                      held={held}
                      kind="quickslot"
                      label={`${SET_NAMES[set]}, ${where}`}
                      className={`quickslot ${where}`}
                      open={isPicking(target)}
                      locked={false}
                      dropKey={dropTargetKey(target)}
                      dropOver={drag.overKey === dropTargetKey(target)}
                      onOpen={() => {
                        setPicking(target);
                      }}
                      onEmpty={() => {
                        onChange((draft) => {
                          draft.setQuickslot(set, index, null);
                        });
                      }}
                      onShow={show}
                      onDragStart={(event) => {
                        if (held !== null) drag.start({ ability: held, from: target }, event);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
