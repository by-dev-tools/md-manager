import { useEffect, useState } from 'react';
import { Agentation } from 'agentation';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { ColorRail } from './components/ColorRail';
import { AddRepoModal } from './components/AddRepoModal';
import { OverflowMenu } from './components/OverflowMenu';
import { DevPanel } from './components/DevPanel';
import { useStore } from './store';

export function App() {
  const { state, docById, createDraft } = useStore();
  const [addRepoOpen, setAddRepoOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const doc = docById(state.selectedDocId);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inEditable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        (target?.isContentEditable ?? false);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createDraft('unattached');
        return;
      }
      if (e.key === 'Escape') {
        setAddRepoOpen(false);
        setOverflowOpen(false);
      }
      if (!inEditable && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // room for future global shortcuts
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [createDraft]);

  return (
    <div className="app">
      <Sidebar onOpenAddRepo={() => setAddRepoOpen(true)} />
      <main className="page-area">
        <div className="surface">
          <Editor
            doc={doc}
            onOpenOverflow={() => setOverflowOpen((v) => !v)}
          />
          {overflowOpen && <OverflowMenu onClose={() => setOverflowOpen(false)} />}
        </div>
        <ColorRail />
      </main>
      {addRepoOpen && <AddRepoModal onClose={() => setAddRepoOpen(false)} />}
      {import.meta.env.DEV && <DevPanel />}
      {import.meta.env.DEV && <Agentation />}
    </div>
  );
}
