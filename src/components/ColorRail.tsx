import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { PaletteIcon } from './icons';

const HUE_STOPS = [
  { y: 0.0, h: 28 },
  { y: 0.14, h: 38 },
  { y: 0.28, h: 50 },
  { y: 0.42, h: 85 },
  { y: 0.56, h: 145 },
  { y: 0.7, h: 205 },
  { y: 0.84, h: 245 },
  { y: 1.0, h: 310 },
];

const PRESETS: { label: string; color: string }[] = [
  { label: 'Peach', color: 'hsl(30, 60%, 88%)' },
  { label: 'Sun', color: 'hsl(50, 50%, 88%)' },
  { label: 'Mint', color: 'hsl(140, 40%, 88%)' },
  { label: 'Sky', color: 'hsl(200, 45%, 89%)' },
  { label: 'Lavender', color: 'hsl(255, 35%, 90%)' },
  { label: 'Blush', color: 'hsl(340, 40%, 91%)' },
  { label: 'Sand', color: 'hsl(40, 12%, 93%)' },
];

function hueAt(y: number): number {
  y = Math.max(0, Math.min(1, y));
  for (let i = 0; i < HUE_STOPS.length - 1; i++) {
    const a = HUE_STOPS[i];
    const b = HUE_STOPS[i + 1];
    if (y >= a.y && y <= b.y) {
      const t = (y - a.y) / (b.y - a.y);
      return a.h + t * (b.h - a.h);
    }
  }
  return HUE_STOPS[HUE_STOPS.length - 1].h;
}

function colorFor(y: number, intensity: number): string {
  const h = hueAt(y);
  const s = 20 + intensity * 50;
  const l = 95 - intensity * 12;
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
}

function edgeFor(y: number): string {
  return `hsla(${hueAt(y).toFixed(0)}, 30%, 50%, 0.10)`;
}

export function ColorRail() {
  const { state, setPageTint } = useStore();
  const stripRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [strip, setStrip] = useState<{ y: number; intensity: number }>({
    y: 0.12,
    intensity: 1,
  });
  const draggingRef = useRef(false);
  const [activePreset, setActivePreset] = useState<string | null>(
    PRESETS.find((p) => p.color === state.pageTint)?.color ?? null,
  );

  // Sync marker location when an external preset / hex sets the color
  useEffect(() => {
    const match = state.pageTint.match(/hsl\(([\d.]+)/);
    if (match) {
      const targetH = parseFloat(match[1]);
      let bestY = 0;
      let bestDiff = Infinity;
      for (let yy = 0; yy <= 1; yy += 0.01) {
        const diff = Math.abs(hueAt(yy) - targetH);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestY = yy;
        }
      }
      setStrip((s) => ({ ...s, y: bestY }));
    }
  }, [state.pageTint]);

  const applyFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = stripRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const leftOfStrip = Math.max(0, rect.left - clientX);
      const intensity = 1 - Math.min(1, leftOfStrip / 240);
      const next = { y, intensity };
      setStrip(next);
      const c = colorFor(y, intensity);
      setPageTint(c, edgeFor(y));
      setActivePreset(null);
      const ind = indicatorRef.current;
      if (ind) {
        ind.style.left = Math.min(rect.left, clientX) + 'px';
        ind.style.top = clientY + 'px';
        ind.style.background = c;
      }
    },
    [setPageTint],
  );

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      applyFromPointer(e.clientX, e.clientY);
    }
    function onUp() {
      if (draggingRef.current) {
        draggingRef.current = false;
        indicatorRef.current?.classList.remove('active');
      }
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [applyFromPointer]);

  const onStripDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    indicatorRef.current?.classList.add('active');
    applyFromPointer(e.clientX, e.clientY);
    e.preventDefault();
  };

  const markerColor = colorFor(strip.y, strip.intensity);

  return (
    <div className="color-rail">
      <div className="color-strip" ref={stripRef} onMouseDown={onStripDown}>
        <div
          className="color-marker"
          style={{
            top: strip.y * 100 + '%',
            background: state.pageTint || markerColor,
          }}
        />
      </div>
      <div className="color-presets">
        {PRESETS.map((p) => (
          <button
            key={p.color}
            className={`preset-swatch${activePreset === p.color ? ' active' : ''}`}
            title={p.label}
            style={{ background: p.color }}
            onClick={() => {
              setPageTint(p.color);
              setActivePreset(p.color);
            }}
          />
        ))}
        <label className="manual-pick" title="Pick a custom color">
          <PaletteIcon />
          <input
            type="color"
            onInput={(e) => {
              const hex = (e.target as HTMLInputElement).value;
              setPageTint(hex);
              setActivePreset(null);
            }}
          />
        </label>
      </div>
      <div ref={indicatorRef} className="drag-indicator" />
    </div>
  );
}
