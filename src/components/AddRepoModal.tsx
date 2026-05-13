import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';

interface Props {
  onClose: () => void;
}

export function AddRepoModal({ onClose }: Props) {
  const { addRepo } = useStore();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const confirm = () => {
    const id = addRepo(value);
    if (id) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-title">Add a repo</div>
        <div className="modal-subtitle">
          Paste a local path or a GitHub URL. The app will scan for markdown files and show them in the sidebar.
        </div>
        <input
          ref={inputRef}
          type="text"
          className="modal-input"
          placeholder="~/code/my-repo  or  github.com/user/repo"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirm();
          }}
        />
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={confirm}>
            Add repo
          </button>
        </div>
      </div>
    </div>
  );
}
