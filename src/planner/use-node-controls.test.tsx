import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import type { JSX } from 'react';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { useNodeControls } from './use-node-controls';

type NodeProps = {
  readonly give: () => void;
  readonly takeBack: () => void;
};

function Node({ give, takeBack }: NodeProps): JSX.Element {
  const controls = useNodeControls(give, takeBack);
  return (
    <button type="button" {...controls}>
      Precision
    </button>
  );
}

type Controls = {
  readonly user: UserEvent;
  readonly node: HTMLElement;
  readonly give: Mock<() => void>;
  readonly takeBack: Mock<() => void>;
};

const renderNode = (): Controls => {
  const user = userEvent.setup();
  const give = vi.fn<() => void>();
  const takeBack = vi.fn<() => void>();
  render(<Node give={give} takeBack={takeBack} />);
  return { user, node: screen.getByRole('button', { name: 'Precision' }), give, takeBack };
};

// A tap as a touch screen sends it. Synchronous, because the timers are fake in the tests that tap,
// so the test decides when the double-tap window runs out.
const tap = (node: HTMLElement): void => {
  fireEvent.pointerDown(node, { pointerType: 'touch' });
  fireEvent.click(node);
};

afterEach(() => {
  vi.useRealTimers();
});

describe('useNodeControls', () => {
  it('gives at once on a click, on Enter and on Space', async () => {
    const { user, node, give, takeBack } = renderNode();

    await user.click(node);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect([give.mock.calls.length, takeBack.mock.calls.length]).toEqual([3, 0]);
  });

  it('takes back on a right-click, on Delete and on Backspace', async () => {
    const { user, node, give, takeBack } = renderNode();

    await user.pointer({ keys: '[MouseRight]', target: node });
    node.focus();
    await user.keyboard('{Delete}{Backspace}');

    expect([give.mock.calls.length, takeBack.mock.calls.length]).toEqual([0, 3]);
  });

  it('gives on a tap once the double-tap window has run out', () => {
    vi.useFakeTimers();
    const { node, give } = renderNode();

    tap(node);
    const beforeWindow = give.mock.calls.length;
    vi.advanceTimersByTime(300);

    expect([beforeWindow, give.mock.calls.length]).toEqual([0, 1]);
  });

  it('takes back on a double tap without giving', () => {
    vi.useFakeTimers();
    const { node, give, takeBack } = renderNode();

    tap(node);
    tap(node);
    vi.advanceTimersByTime(300);

    expect([give.mock.calls.length, takeBack.mock.calls.length]).toEqual([0, 1]);
  });
});
