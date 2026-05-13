import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import type { Draft } from '../types';
import { FolderIcon, CloseIcon, SearchIcon } from './icons';

interface Props {
  draft: Draft;
  onClose: () => void;
}

export function AttachPopover({ draft, onClose }: Props) {
  const { state, attachDraft } = useStore();
  const [q, setQ] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const repos = useMemo(() => {
    const norm = q.trim().toLowerCase();
    if (!norm) return state.repos;
    return state.repos.filter((r) => r.name.toLowerCase().includes(norm));
  }, [q, state.repos]);

  const meta = (repoId: string) => {
    const drafts = state.drafts.filter((d) => d.attachedRepo === repoId).length;
    const files = state.repoFiles.filter((f) => f.repoId === repoId).length;
    return `${drafts} draft${drafts === 1 ? '' : 's'} · ${files} file${files === 1 ? '' : 's'}`;
  };

  return (
    <div ref={rootRef} className="attach-popover">
      <div className="pop-search">
        <SearchIcon size={12} />
        <input
          autoFocus
          placeholder="Find repo"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="pop-section-label">All repos</div>
      {repos.map((r) => (
        <button
          key={r.id}
          className="pop-row"
          onClick={() => {
            attachDraft(draft.id, r.id);
            onClose();
          }}
        >
          <span className="pop-icon">
            <FolderIcon size={14} />
          </span>
          <div className="pop-info">
            <span className="pop-name">{r.name}</span>
            <span className="pop-meta">{meta(r.id)}</span>
          </div>
        </button>
      ))}
      {draft.attachedRepo && (
        <button
          className="pop-row detach"
          onClick={() => {
            attachDraft(draft.id, null);
            onClose();
          }}
        >
          <span className="pop-icon">
            <CloseIcon size={14} />
          </span>
          <span>Detach from repo</span>
        </button>
      )}
    </div>
  );
}
