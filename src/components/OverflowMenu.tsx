import { useEffect, useRef } from 'react';
import { useStore } from '../store';

interface Props {
  onClose: () => void;
}

export function OverflowMenu({ onClose }: Props) {
  const { state, setSurfaceMode } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
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

  const toggleMode = () => {
    setSurfaceMode(state.surfaceMode === 'floating' ? 'flat' : 'floating');
    onClose();
  };

  return (
    <div ref={ref} className="overflow-menu">
      <button className="menu-item" onClick={toggleMode}>
        <span>Surface mode</span>
        <span className="menu-meta">
          {state.surfaceMode === 'floating' ? 'Floating' : 'Flat'}
        </span>
      </button>
    </div>
  );
}
