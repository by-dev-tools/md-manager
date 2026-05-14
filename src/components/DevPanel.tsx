import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mumbai.devpanel.v4';

interface RangeKnob {
  kind: 'range';
  key: string;
  label: string;
  cssVar: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
  digits?: number;
}

interface ToggleKnob {
  kind: 'toggle';
  key: string;
  label: string;
  /** Body class added when the toggle is on. */
  bodyClass: string;
  default: boolean;
}

interface SelectOption {
  value: string;
  label: string;
  /** Body class to add when this option is selected. Omit for the default. */
  bodyClass?: string;
}

interface SelectKnob {
  kind: 'select';
  key: string;
  label: string;
  options: SelectOption[];
  default: string;
}

type Knob = RangeKnob | ToggleKnob | SelectKnob;

const KNOBS: Knob[] = [
  {
    kind: 'range',
    key: 'opacity',
    label: 'Surface opacity',
    cssVar: '--surface-opacity',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.6,
    digits: 2,
  },
  {
    kind: 'range',
    key: 'radius',
    label: 'Surface radius',
    cssVar: '--surface-radius',
    min: 0,
    max: 48,
    step: 1,
    default: 8,
    unit: 'px',
    digits: 0,
  },
  {
    kind: 'range',
    key: 'gutter',
    label: 'Surface gutter',
    cssVar: '--surface-gutter',
    min: 0,
    max: 32,
    step: 1,
    default: 8,
    unit: 'px',
    digits: 0,
  },
  {
    kind: 'range',
    key: 'shadow',
    label: 'Surface shadow',
    cssVar: '--surface-shadow-alpha',
    min: 0,
    max: 1,
    step: 0.05,
    default: 1,
    digits: 2,
  },
  {
    kind: 'select',
    key: 'surfaceMode',
    label: 'Surface mode',
    default: 'floating',
    options: [
      { value: 'floating', label: 'Floating', bodyClass: 'mode-floating' },
      { value: 'flat', label: 'Flat', bodyClass: 'mode-flat' },
    ],
  },
  {
    kind: 'range',
    key: 'sidebarFont',
    label: 'Sidebar font',
    cssVar: '--sidebar-font',
    min: 10,
    max: 20,
    step: 1,
    default: 13,
    unit: 'px',
    digits: 0,
  },
  {
    kind: 'range',
    key: 'editorFont',
    label: 'Editor font',
    cssVar: '--editor-font',
    min: 12,
    max: 24,
    step: 1,
    default: 15,
    unit: 'px',
    digits: 0,
  },
  {
    kind: 'toggle',
    key: 'showFileIcons',
    label: 'File icons',
    bodyClass: 'show-file-icons',
    default: false,
  },
  {
    kind: 'toggle',
    key: 'sidebarSans',
    label: 'Sidebar sans (vs mono)',
    bodyClass: 'sidebar-sans',
    default: false,
  },
  {
    kind: 'select',
    key: 'treeVariant',
    label: 'Tree layout',
    default: 'compact',
    options: [
      { value: 'compact', label: 'Compact' },
      { value: 'hanging', label: 'Hanging', bodyClass: 'tree-hanging' },
      { value: 'minimal', label: 'Minimal', bodyClass: 'tree-minimal' },
    ],
  },
];

type Value = number | boolean | string;
type Values = Record<string, Value>;

function defaults(): Values {
  const v: Values = {};
  for (const k of KNOBS) v[k.key] = k.default;
  return v;
}

function load(): { open: boolean; values: Values } {
  const base = { open: false, values: defaults() };
  if (typeof window === 'undefined') return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<{ open: boolean; values: Values }>;
    return {
      open: parsed.open ?? false,
      values: { ...base.values, ...(parsed.values ?? {}) },
    };
  } catch {
    return base;
  }
}

function applyKnob(k: Knob, v: Value) {
  if (k.kind === 'range') {
    const n = typeof v === 'number' ? v : k.default;
    document.documentElement.style.setProperty(
      k.cssVar,
      k.unit ? `${n}${k.unit}` : String(n),
    );
  } else if (k.kind === 'toggle') {
    document.body.classList.toggle(k.bodyClass, Boolean(v));
  } else {
    const value = typeof v === 'string' ? v : k.default;
    for (const opt of k.options) {
      if (!opt.bodyClass) continue;
      document.body.classList.toggle(opt.bodyClass, opt.value === value);
    }
  }
}

export function DevPanel() {
  const initial = load();
  const [open, setOpen] = useState(initial.open);
  const [values, setValues] = useState<Values>(initial.values);

  useEffect(() => {
    for (const k of KNOBS) applyKnob(k, values[k.key]);
  }, [values]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ open, values }));
    } catch {
      /* noop */
    }
  }, [open, values]);

  const reset = () => setValues(defaults());

  return (
    <div className={`dev-panel${open ? ' open' : ''}`}>
      <button
        className="dev-panel-toggle"
        onClick={() => setOpen((v) => !v)}
        title="Dev panel"
      >
        dev
      </button>
      {open && (
        <div className="dev-panel-body">
          {KNOBS.map((k) => {
            if (k.kind === 'range') {
              const v = (values[k.key] as number) ?? k.default;
              return (
                <div key={k.key} className="dev-knob">
                  <div className="dev-row">
                    <label htmlFor={`dev-${k.key}`}>{k.label}</label>
                    <span className="dev-value">
                      {v.toFixed(k.digits ?? 2)}
                      {k.unit ?? ''}
                    </span>
                  </div>
                  <input
                    id={`dev-${k.key}`}
                    type="range"
                    min={k.min}
                    max={k.max}
                    step={k.step}
                    value={v}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [k.key]: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
              );
            }
            if (k.kind === 'toggle') {
              const v = Boolean(values[k.key]);
              return (
                <div key={k.key} className="dev-knob dev-knob-toggle">
                  <label htmlFor={`dev-${k.key}`}>{k.label}</label>
                  <input
                    id={`dev-${k.key}`}
                    type="checkbox"
                    checked={v}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [k.key]: e.target.checked,
                      }))
                    }
                  />
                </div>
              );
            }
            const v = (values[k.key] as string) ?? k.default;
            return (
              <div key={k.key} className="dev-knob dev-knob-select">
                <label htmlFor={`dev-${k.key}`}>{k.label}</label>
                <select
                  id={`dev-${k.key}`}
                  value={v}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [k.key]: e.target.value,
                    }))
                  }
                >
                  {k.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
          <button className="dev-reset" onClick={reset}>
            reset all
          </button>
        </div>
      )}
    </div>
  );
}
