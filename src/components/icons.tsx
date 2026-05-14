import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function SearchIcon(props: { size?: number }) {
  const s = props.size ?? 13;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base}>
      <circle cx="7" cy="7" r="5" />
      <path d="m14 14-3.5-3.5" />
    </svg>
  );
}

export function FileIcon(props: { size?: number }) {
  const s = props.size ?? 13;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base}>
      <path d="M3.5 2.5h6l3 3V13a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" />
      <path d="M9.5 2.5V5.5h3" />
    </svg>
  );
}

export function FolderIcon(props: { size?: number }) {
  const s = props.size ?? 15;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base}>
      <path d="M2.5 4.5a1 1 0 0 1 1-1h3l1.5 1.5h4.5a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V4.5Z" />
    </svg>
  );
}

export function FolderOpenIcon(props: { size?: number }) {
  const s = props.size ?? 13;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base}>
      {/* Back lid */}
      <path d="M2.5 5.5a1 1 0 0 1 1-1h3l1.5 1.5h4.5a1 1 0 0 1 1 1v1H2.5V5.5Z" />
      {/* Open front face — tilted trapezoid */}
      <path d="M1.5 13 3 8h11l-1.5 5h-11Z" />
    </svg>
  );
}

export function RepoIcon(props: { size?: number }) {
  const s = props.size ?? 13;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base} strokeWidth={1.3}>
      {/* Book/repo outline */}
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h7.5a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H4.5A1.5 1.5 0 0 0 3 14.5v-11Z" />
      {/* Bottom spine — shows the open lower edge of the cover */}
      <path d="M3 13a1.5 1.5 0 0 1 1.5-1.5H12" />
    </svg>
  );
}

export function PlusIcon(props: { size?: number }) {
  const s = props.size ?? 12;
  return (
    <svg width={s} height={s} viewBox="0 0 12 12" {...base} strokeWidth={1.6}>
      <path d="M6 2.5v7M2.5 6h7" />
    </svg>
  );
}

export function AttachIcon(props: { size?: number }) {
  const s = props.size ?? 11;
  return (
    <svg width={s} height={s} viewBox="0 0 12 12" {...base} strokeWidth={1.4}>
      <path d="M6 2v8M2 6h8" />
    </svg>
  );
}

export function DotsIcon(props: { size?: number }) {
  const s = props.size ?? 15;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3" cy="8" r="1.1" />
      <circle cx="8" cy="8" r="1.1" />
      <circle cx="13" cy="8" r="1.1" />
    </svg>
  );
}

export function CloseIcon(props: { size?: number }) {
  const s = props.size ?? 14;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function PaletteIcon(props: { size?: number }) {
  const s = props.size ?? 12;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base} strokeWidth={1.4}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2" />
    </svg>
  );
}
