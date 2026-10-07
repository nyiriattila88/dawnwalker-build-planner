import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import type { Build, BuildView } from '../build/build';
import {
  acceptsDrop,
  applyDiscard,
  applyDrop,
  centreDragImage,
  dropTargetKey,
  snapTarget,
  type DragItem,
  type DropPlace,
  type DropTarget,
} from './drag-and-drop';

export type DragAndDrop = {
  // The target the dragged ability would land on now, by its key.
  readonly overKey: string | null;
  readonly start: (item: DragItem, event: DragEvent) => void;
};

type Drag = { readonly item: DragItem; readonly icon: number };

// Where each target is on the page now: the wheel may be scaled down and the page scrolled.
const placesOf = (targets: readonly DropTarget[]): DropPlace[] =>
  targets.flatMap((target) => {
    const element = document.querySelector(`[data-drop="${dropTargetKey(target)}"]`);
    if (element === null) return [];
    const { left, top, width, height } = element.getBoundingClientRect();
    return [{ target, box: { left, top, width, height } }];
  });

// Dragging abilities onto the wheel and the quickslots. The whole page follows the drag, so the target
// comes from where the dragged icon covers a slot, not from the element under the pointer, and an
// ability dragged off its slot and let go anywhere else leaves it.
export function useDragAndDrop(
  build: BuildView,
  targets: readonly DropTarget[],
  apply: (change: (draft: Build) => void) => void,
): DragAndDrop {
  const dragged = useRef<Drag | null>(null);
  const latestBuild = useRef(build);
  const [overKey, setOverKey] = useState<string | null>(null);

  useEffect(() => {
    latestBuild.current = build;
  }, [build]);

  useEffect(() => {
    const targetOf = (event: globalThis.DragEvent, drag: Drag): DropTarget | null =>
      snapTarget([event.clientX, event.clientY], drag.icon, placesOf(targets), (target) =>
        acceptsDrop(latestBuild.current, drag.item, target),
      );
    const over = (event: globalThis.DragEvent): void => {
      const drag = dragged.current;
      if (drag === null) return;
      const target = targetOf(event, drag);
      setOverKey(target === null ? null : dropTargetKey(target));
      if (target !== null || drag.item.from !== null) event.preventDefault();
    };
    const drop = (event: globalThis.DragEvent): void => {
      const drag = dragged.current;
      if (drag === null) return;
      event.preventDefault();
      const target = targetOf(event, drag);
      dragged.current = null;
      setOverKey(null);
      apply((draft) => {
        if (target !== null) applyDrop(draft, drag.item, target);
        else applyDiscard(draft, drag.item);
      });
    };
    const finish = (): void => {
      dragged.current = null;
      setOverKey(null);
    };
    document.addEventListener('dragover', over);
    document.addEventListener('drop', drop);
    document.addEventListener('dragend', finish);
    return () => {
      document.removeEventListener('dragover', over);
      document.removeEventListener('drop', drop);
      document.removeEventListener('dragend', finish);
    };
  }, [targets, apply]);

  const start = useCallback((item: DragItem, event: DragEvent) => {
    event.dataTransfer.setData('text/plain', item.ability.name);
    event.dataTransfer.effectAllowed = 'move';
    dragged.current = { item, icon: centreDragImage(event) };
  }, []);

  return { overKey, start };
}
