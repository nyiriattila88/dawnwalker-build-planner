import type { JSX } from 'react';

// The game's skill point mark: a wheel of teeth around a hub.
export function SkillPointIcon(): JSX.Element {
  return (
    <svg className="cost-icon" viewBox="-12 -12 24 24" aria-label="skill points" role="img">
      <path d="M0-11 2.6-7.9 6.7-8.6 6.9-4.5 10.8-3 8.8.5 10.8 4 6.9 5.5 6.7 9.6 2.6 8.9 0 12-2.6 8.9-6.7 9.6-6.9 5.5-10.8 4-8.8.5-10.8-3-6.9-4.5-6.7-8.6-2.6-7.9Z" />
      <circle r="3.6" className="hub" />
    </svg>
  );
}

// A segment of the thirty day clock.
export function TimeIcon(): JSX.Element {
  return (
    <svg className="cost-icon" viewBox="0 0 16 24" aria-label="time segments" role="img">
      <path d="M2 1h12v2c0 4-4 6.5-4 9s4 5 4 9v2H2v-2c0-4 4-6.5 4-9S2 7 2 3Z" />
    </svg>
  );
}
