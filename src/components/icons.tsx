import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function PencilIcon(props: { size?: number }) {
  const s = props.size ?? 15;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base}>
      <path d="M11.5 2.5 13.5 4.5 6 12l-3 1 1-3 7.5-7.5Z" />
    </svg>
  );
}

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

export function ChevronRight(props: { size?: number }) {
  const s = props.size ?? 11;
  return (
    <svg width={s} height={s} viewBox="0 0 12 12" {...base}>
      <path d="m4.5 3 3 3-3 3" />
    </svg>
  );
}

export function ChevronDown(props: { size?: number }) {
  const s = props.size ?? 13;
  return (
    <svg width={s} height={s} viewBox="0 0 12 12" {...base}>
      <path d="m3 4.5 3 3 3-3" />
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

export function EyeIcon(props: { size?: number }) {
  const s = props.size ?? 14;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base} strokeWidth={1.4}>
      <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

export function CodeIcon(props: { size?: number }) {
  const s = props.size ?? 14;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base} strokeWidth={1.5}>
      <path d="m5.5 4.5-3 3.5 3 3.5M10.5 4.5l3 3.5-3 3.5" />
    </svg>
  );
}

export function PanelLeftIcon(props: { size?: number }) {
  const s = props.size ?? 15;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base} strokeWidth={1.4}>
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M6 3v10" />
    </svg>
  );
}

export function CopyIcon(props: { size?: number }) {
  const s = props.size ?? 14;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base} strokeWidth={1.4}>
      <rect x="5" y="5" width="9" height="9" rx="1.5" />
      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
    </svg>
  );
}

export function TrashIcon(props: { size?: number }) {
  const s = props.size ?? 14;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" {...base} strokeWidth={1.4}>
      <path d="M3 4.5h10M6.5 4.5V3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1.5" />
      <path d="M4.5 4.5v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-8" />
      <path d="M7 7v4M9 7v4" />
    </svg>
  );
}
