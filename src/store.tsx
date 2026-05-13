import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Doc,
  DocId,
  Draft,
  Repo,
  RepoFile,
  RepoId,
  SurfaceMode,
} from './types';
import { seedDrafts, seedRepoFiles, seedRepos } from './data/seed';
import { deriveTitle } from './lib/markdown';

const STORAGE_KEY = 'mumbai.notes.v1';

interface PersistedState {
  drafts: Draft[];
  repos: Repo[];
  repoFiles: RepoFile[];
  selectedDocId: DocId | null;
  expanded: Record<string, boolean>;
  pageTint: string;
  pageTintEdge: string;
  surfaceMode: SurfaceMode;
}

function defaultState(): PersistedState {
  return {
    drafts: seedDrafts,
    repos: seedRepos,
    repoFiles: seedRepoFiles,
    selectedDocId: seedDrafts[0]?.id ?? null,
    expanded: { unattached: true, 'mochi-emr': true, 'folder:mochi-emr:core-docs/': true },
    pageTint: 'hsl(30, 60%, 88%)',
    pageTintEdge: 'hsla(30, 30%, 50%, 0.10)',
    surfaceMode: 'floating',
  };
}

function loadState(): PersistedState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const base = defaultState();
    return { ...base, ...parsed };
  } catch {
    return defaultState();
  }
}

interface StoreApi {
  state: PersistedState;
  saving: boolean;
  docById: (id: DocId | null) => Doc | null;
  selectDoc: (id: DocId | null) => void;
  createDraft: (target: RepoId | 'unattached') => DraftId;
  updateDraftBody: (id: DraftId, md: string) => void;
  /** Cheap title-only update for preview-mode edits that don't round-trip. */
  setDraftTitle: (id: DraftId, title: string) => void;
  attachDraft: (id: DraftId, target: RepoId | null) => void;
  updateRepoFileBody: (id: string, md: string) => void;
  addRepo: (rawInput: string) => RepoId | null;
  setExpanded: (key: string, value: boolean) => void;
  toggleExpanded: (key: string) => void;
  setPageTint: (tint: string, edge?: string) => void;
  setSurfaceMode: (mode: SurfaceMode) => void;
}

type DraftId = string;

const StoreCtx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [saving, setSaving] = useState(false);
  const savingTimer = useRef<number | null>(null);

  // Persist whenever state changes (debounced).
  useEffect(() => {
    setSaving(true);
    if (savingTimer.current !== null) window.clearTimeout(savingTimer.current);
    savingTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* swallow quota errors in v1 */
      }
      setSaving(false);
    }, 600);
    return () => {
      if (savingTimer.current !== null) window.clearTimeout(savingTimer.current);
    };
  }, [state]);

  // Apply CSS variables for page tint and surface mode.
  useEffect(() => {
    document.documentElement.style.setProperty('--page-tint', state.pageTint);
    document.documentElement.style.setProperty('--page-tint-edge', state.pageTintEdge);
  }, [state.pageTint, state.pageTintEdge]);

  useEffect(() => {
    document.body.classList.toggle('mode-floating', state.surfaceMode === 'floating');
    document.body.classList.toggle('mode-flat', state.surfaceMode === 'flat');
  }, [state.surfaceMode]);

  const docById = useCallback(
    (id: DocId | null): Doc | null => {
      if (!id) return null;
      return (
        state.drafts.find((d) => d.id === id) ??
        state.repoFiles.find((f) => f.id === id) ??
        null
      );
    },
    [state.drafts, state.repoFiles],
  );

  const selectDoc = useCallback((id: DocId | null) => {
    setState((s) => ({ ...s, selectedDocId: id }));
  }, []);

  const createDraft = useCallback((target: RepoId | 'unattached'): DraftId => {
    const id = 'draft-' + Math.random().toString(36).slice(2, 9);
    const now = Date.now();
    const draft: Draft = {
      id,
      kind: 'draft',
      title: 'Untitled draft',
      md: '',
      attachedRepo: target === 'unattached' ? null : target,
      createdAt: now,
      updatedAt: now,
    };
    setState((s) => ({
      ...s,
      drafts: [draft, ...s.drafts],
      selectedDocId: id,
      expanded: { ...s.expanded, [target]: true },
    }));
    return id;
  }, []);

  const updateDraftBody = useCallback((id: DraftId, md: string) => {
    setState((s) => ({
      ...s,
      drafts: s.drafts.map((d) =>
        d.id === id
          ? { ...d, md, title: deriveTitle(md, 'Untitled draft'), updatedAt: Date.now() }
          : d,
      ),
    }));
  }, []);

  const setDraftTitle = useCallback((id: DraftId, title: string) => {
    const trimmed = title.trim().slice(0, 80) || 'Untitled draft';
    setState((s) => ({
      ...s,
      drafts: s.drafts.map((d) => (d.id === id ? { ...d, title: trimmed } : d)),
    }));
  }, []);

  const updateRepoFileBody = useCallback((id: string, md: string) => {
    setState((s) => ({
      ...s,
      repoFiles: s.repoFiles.map((f) => (f.id === id ? { ...f, md } : f)),
    }));
  }, []);

  const attachDraft = useCallback((id: DraftId, target: RepoId | null) => {
    setState((s) => {
      const next = {
        ...s,
        drafts: s.drafts.map((d) =>
          d.id === id ? { ...d, attachedRepo: target } : d,
        ),
      };
      if (target) {
        next.expanded = { ...s.expanded, [target]: true };
      } else {
        next.expanded = { ...s.expanded, unattached: true };
      }
      return next;
    });
  }, []);

  const addRepo = useCallback((rawInput: string): RepoId | null => {
    const raw = rawInput.trim();
    if (!raw) return null;
    let name = raw.split(/[\/\\]/).filter(Boolean).pop() || raw;
    name = name.replace(/\.git$/, '');
    const id = name;
    setState((s) => {
      if (s.repos.some((r) => r.id === id)) return s;
      const repo: Repo = { id, name, source: raw };
      return {
        ...s,
        repos: [...s.repos, repo],
        expanded: { ...s.expanded, [id]: true },
      };
    });
    return id;
  }, []);

  const setExpanded = useCallback((key: string, value: boolean) => {
    setState((s) => ({ ...s, expanded: { ...s.expanded, [key]: value } }));
  }, []);

  const toggleExpanded = useCallback((key: string) => {
    setState((s) => ({
      ...s,
      expanded: { ...s.expanded, [key]: !s.expanded[key] },
    }));
  }, []);

  const setPageTint = useCallback((tint: string, edge?: string) => {
    setState((s) => ({
      ...s,
      pageTint: tint,
      pageTintEdge: edge ?? s.pageTintEdge,
    }));
  }, []);

  const setSurfaceMode = useCallback((mode: SurfaceMode) => {
    setState((s) => ({ ...s, surfaceMode: mode }));
  }, []);

  const api: StoreApi = useMemo(
    () => ({
      state,
      saving,
      docById,
      selectDoc,
      createDraft,
      updateDraftBody,
      setDraftTitle,
      updateRepoFileBody,
      attachDraft,
      addRepo,
      setExpanded,
      toggleExpanded,
      setPageTint,
      setSurfaceMode,
    }),
    [
      state,
      saving,
      docById,
      selectDoc,
      createDraft,
      updateDraftBody,
      setDraftTitle,
      updateRepoFileBody,
      attachDraft,
      addRepo,
      setExpanded,
      toggleExpanded,
      setPageTint,
      setSurfaceMode,
    ],
  );

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
