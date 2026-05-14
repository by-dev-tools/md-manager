import { useEffect, useState } from 'react';
import { Agentation } from 'agentation';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { ColorRail } from './components/ColorRail';
import { AddRepoModal } from './components/AddRepoModal';
import { DevPanel } from './components/DevPanel';
import { useStore } from './store';

const SIDEBAR_STORAGE_KEY = 'mumbai.sidebarCollapsed.v1';

function loadSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function App() {
  const { state, docById, createDraft } = useStore();
  const [addRepoOpen, setAddRepoOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(loadSidebarCollapsed);
  const doc = docById(state.selectedDocId);

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', sidebarCollapsed);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      /* noop */
    }
  }, [sidebarCollapsed]);

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
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarCollapsed((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setAddRepoOpen(false);
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
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          />
        </div>
        <ColorRail />
      </main>
      {addRepoOpen && <AddRepoModal onClose={() => setAddRepoOpen(false)} />}
      {import.meta.env.DEV && (
        <>
          <DevPanel />
          <Agentation />
        </>
      )}
    </div>
  );
}
