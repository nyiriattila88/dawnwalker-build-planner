import { render, screen } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { SharePanel } from './share-panel';

const CODE = '.BdtLTzYg_s7Micg';
const LINK = `https://planner.test/?build=${CODE}`;

type Panel = {
  readonly user: UserEvent;
  readonly onLoad: Mock<(text: string) => boolean>;
};

const renderPanel = ({ readable = true, unreadableAddress = false } = {}): Panel => {
  const user = userEvent.setup();
  const onLoad = vi.fn<(text: string) => boolean>(() => readable);
  render(
    <SharePanel code={CODE} link={LINK} onLoad={onLoad} unreadableAddress={unreadableAddress} />,
  );
  return { user, onLoad };
};

const pasteField = (): HTMLElement => screen.getByRole('textbox', { name: 'Paste a build code' });

describe('SharePanel', () => {
  it('copies the build code and the link and says which one it copied', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    const code = await navigator.clipboard.readText();
    const afterCode = screen.getByRole('status').textContent;
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    const link = await navigator.clipboard.readText();

    expect([code, afterCode, link]).toEqual([CODE, 'Build code copied to the clipboard.', LINK]);
    expect(screen.getByRole('status')).toHaveTextContent('Link copied to the clipboard.');
  });

  it('asks for a copy by hand when the browser blocks the clipboard', async () => {
    const { user } = renderPanel();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Blocked'));

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'The browser blocked the clipboard: select the code and copy it by hand.',
    );
  });

  it('loads a pasted code with Enter and empties the field', async () => {
    const { user, onLoad } = renderPanel();

    await user.type(pasteField(), `  ${LINK} {Enter}`);

    expect(onLoad).toHaveBeenCalledWith(`  ${LINK} `);
    expect(pasteField()).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('Build loaded.');
  });

  it('keeps pasted text that holds no build code and says so', async () => {
    const { user } = renderPanel({ readable: false });

    await user.type(pasteField(), 'not a build code');
    await user.click(screen.getByRole('button', { name: 'Load' }));

    expect(pasteField()).toHaveValue('not a build code');
    expect(screen.getByRole('status')).toHaveTextContent('Invalid build code.');
  });

  it('says the code in the page address could not be read', () => {
    renderPanel({ unreadableAddress: true });

    expect(screen.getByRole('status')).toHaveTextContent(
      'The build code in the page address could not be read, so an empty build opened instead.',
    );
  });
});
