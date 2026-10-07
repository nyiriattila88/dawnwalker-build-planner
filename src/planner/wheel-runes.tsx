import type { JSX } from 'react';

type RuneSet = {
  readonly strokes: string;
  readonly rings: readonly (readonly [number, number, number])[];
  readonly dots: readonly (readonly [number, number])[];
};

// The runes engraved in the disc of the game's ability wheel, traced from a photo of the screen. The
// strokes are in the pixels of that tracing, and the transform lays them onto the wheel's disc.
const DISC: RuneSet = {
  strokes: [
    'M185,100 H262 M190,100 V62 M224,100 V50 M256,100 V62',
    'M188,180 L212,137 L232,172 M232,160 L250,128 L268,158 M208,212 L227,186 L246,212',
    'M115,262 V302 M96,276 H134 M92,346 L113,370 L136,346 M113,334 V370 M115,407 V522 M86,463 H146',
    'M410,300 L448,332 L500,284 M422,316 L438,296',
    'M433,358 V442 M461,354 V442 M405,381 H433 M407,411 H433 M461,377 H490 M461,407 H488',
    'M414,480 L455,506 L498,479 M414,507 L455,535 L498,506',
    'M396,622 L470,690 L396,758 L322,690 Z M396,654 V726 M360,690 H432',
    'M124,718 L150,748 M176,716 L150,748 V852 M128,805 H172',
  ].join(' '),
  rings: [
    [115, 355, 52],
    [396, 690, 38],
  ],
  dots: [
    [32, 380],
    [32, 410],
    [32, 440],
    [536, 413],
    [565, 418],
    [534, 446],
    [563, 449],
    [536, 470],
    [566, 471],
  ],
};

// The runes carved into the stone around the game's wheel, in the pixels of the same photo with the
// wheel's centre at 973, 521.
const SURROUND: RuneSet = {
  strokes: [
    'M474,130 V152 M463,141 H485 M398,190 Q474,148 560,176 M474,322 L552,190 M540,190 H556 V206',
    'M572,228 L580,240 M578,262 L586,274 L578,284 M566,300 L578,308',
    'M397,342 Q490,372 585,342 M405,356 Q490,384 578,356 M352,387 Q480,428 608,394',
    'M497,452 V532 M474,487 H520 M530,560 L540,572 L550,560 M545,572 V586 M556,582 L566,566 L576,582',
    'M564,748 L580,770 L596,748 M580,770 V744 M580,793 V842 M562,820 H598',
    'M1390,222 V212 H1432 V222 M1411,196 V252 M1411,252 L1396,270 M1411,252 L1426,270 M1399,236 H1423',
    'M1470,362 L1523,414 L1470,466 L1417,414 Z M1470,420 V446 M1460,434 H1480',
    'M1508,519 Q1556,478 1606,519 M1556,466 V494 M1543,480 H1569 M1620,471 L1634,485 M1634,471 L1620,485',
    'M1519,590 H1612 M1566,578 V604 M1574,604 L1588,618 M1588,604 L1574,618',
    'M1458,535 L1466,548 L1450,548 Z M1452,578 H1464 M1452,585 H1462 M1452,592 H1464',
    'M1462,662 Q1558,742 1656,662 M1648,580 L1660,590 L1648,600 M1652,622 L1660,636 L1668,622',
    'M1553,333 Q1650,410 1800,422 M1575,318 Q1670,392 1820,402',
    'M1737,160 V185 M1725,172 H1749 M1740,205 V342 M1712,300 L1740,206 L1768,300 M1722,268 H1758',
    'M1655,217 L1665,207 M1660,248 H1672 M1650,282 L1662,272 L1674,282 M1748,427 V553 M1730,470 H1768',
  ].join(' '),
  rings: [
    [472, 326, 7],
    [580, 762, 31],
    [1470, 404, 16],
    [1511, 590, 8],
  ],
  dots: [
    [1400, 303],
    [1387, 331],
    [1401, 331],
    [1385, 354],
    [1402, 354],
  ],
};

function Runes({
  set,
  className,
}: {
  readonly set: RuneSet;
  readonly className: string;
}): JSX.Element {
  return (
    <g className={className}>
      <path d={set.strokes} />
      {set.rings.map(([cx, cy, r]) => (
        <circle key={`${String(cx)}-${String(cy)}`} cx={cx} cy={cy} r={r} />
      ))}
      {set.dots.map(([cx, cy]) => (
        <circle key={`${String(cx)}-${String(cy)}`} className="dot" cx={cx} cy={cy} r={6} />
      ))}
    </g>
  );
}

// Carved into the stone, not drawn on it: a dark groove whose lower right wall catches the light,
// with the uneven edge of a chisel.
function Carved({ set, id }: { readonly set: RuneSet; readonly id: string }): JSX.Element {
  return (
    <>
      <defs>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={3} />
          <feDisplacementMap
            in="SourceGraphic"
            scale={3}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <g transform="translate(2 2)">
          <Runes set={set} className="rune-rim" />
        </g>
        <Runes set={set} className="rune-groove" />
      </g>
    </>
  );
}

export function WheelRunes(): JSX.Element {
  return (
    <svg className="wheel-runes" viewBox="0 0 760 760" aria-hidden="true">
      <g transform="translate(178.3 76) scale(0.6315)">
        <Carved set={DISC} id="chisel-disc" />
      </g>
    </svg>
  );
}

// Reaches past the wheel on both sides, as far as its column lets it be seen.
export function WheelSurround(): JSX.Element {
  return (
    <svg className="wheel-surround" viewBox="-83 120 2112 802" aria-hidden="true">
      <Carved set={SURROUND} id="chisel-surround" />
    </svg>
  );
}
