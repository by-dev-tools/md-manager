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
  };
}

function loadState(): PersistedState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const base = defaultState();
    const merged = { ...base, ...parsed };
    // Migration: backfill `wasEverEdited` on persisted drafts that predate the
    // field. Drafts already in storage have content the user kept across sessions —
    // treat them as touched so the pristine-cleanup doesn't drop them.
    merged.drafts = (merged.drafts ?? []).map((d) => {
      const draft = d as Draft & Partial<{ wasEverEdited: boolean }>;
      return draft.wasEverEdited === undefined
        ? { ...draft, wasEverEdited: true }
        : (draft as Draft);
    });
    return merged;
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
  deleteDraft: (id: DraftId) => Draft | null;
  /** Re-insert a previously-deleted draft (used by undo-toast). */
  restoreDraft: (draft: Draft) => void;
  updateDraftBody: (id: DraftId, md: string) => void;
  /** Cheap title-only update for preview-mode edits that don't round-trip. */
  setDraftTitle: (id: DraftId, title: string) => void;
  attachDraft: (id: DraftId, target: RepoId | null) => void;
  updateRepoFileBody: (id: string, md: string) => void;
  addRepo: (rawInput: string) => RepoId | null;
  setExpanded: (key: string, value: boolean) => void;
  toggleExpanded: (key: string) => void;
  setPageTint: (tint: string, edge?: string) => void;
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

  // Drop any pristine draft (never typed into) when navigating away from it.
  // SAFETY: only drafts where wasEverEdited is false are eligible — a draft the
  // user touched and then cleared is preserved.
  const dropPristineOnLeave = (s: PersistedState, nextSelectedId: DocId | null): PersistedState => {
    const prevId = s.selectedDocId;
    if (!prevId || prevId === nextSelectedId) return s;
    const prev = s.drafts.find((d) => d.id === prevId);
    if (!prev || prev.wasEverEdited) return s;
    return { ...s, drafts: s.drafts.filter((d) => d.id !== prevId) };
  };

  const selectDoc = useCallback((id: DocId | null) => {
    setState((s) => {
      const cleaned = dropPristineOnLeave(s, id);
      return { ...cleaned, selectedDocId: id };
    });
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
      wasEverEdited: false,
    };
    setState((s) => {
      // Route through the pristine-drop helper so a chain of "+ → + → +" doesn't
      // leave behind a trail of never-touched drafts.
      const cleaned = dropPristineOnLeave(s, id);
      return {
        ...cleaned,
        drafts: [draft, ...cleaned.drafts],
        selectedDocId: id,
        expanded: { ...cleaned.expanded, [target]: true },
      };
    });
    return id;
  }, []);

  const deleteDraft = useCallback((id: DraftId): Draft | null => {
    let removed: Draft | null = null;
    setState((s) => {
      const idx = s.drafts.findIndex((d) => d.id === id);
      if (idx < 0) return s;
      removed = s.drafts[idx];
      const drafts = [...s.drafts.slice(0, idx), ...s.drafts.slice(idx + 1)];
      const selectedDocId =
        s.selectedDocId === id ? (drafts[0]?.id ?? null) : s.selectedDocId;
      return { ...s, drafts, selectedDocId };
    });
    return removed;
  }, []);

  const restoreDraft = useCallback((draft: Draft) => {
    setState((s) => {
      if (s.drafts.some((d) => d.id === draft.id)) return s;
      return { ...s, drafts: [draft, ...s.drafts] };
    });
  }, []);

  const updateDraftBody = useCallback((id: DraftId, md: string) => {
    setState((s) => ({
      ...s,
      drafts: s.drafts.map((d) =>
        d.id === id
          ? {
              ...d,
              md,
              title: deriveTitle(md, 'Untitled draft'),
              updatedAt: Date.now(),
              wasEverEdited: d.wasEverEdited || md.length > 0,
            }
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

  const api: StoreApi = useMemo(
    () => ({
      state,
      saving,
      docById,
      selectDoc,
      createDraft,
      deleteDraft,
      restoreDraft,
      updateDraftBody,
      setDraftTitle,
      updateRepoFileBody,
      attachDraft,
      addRepo,
      setExpanded,
      toggleExpanded,
      setPageTint,
    }),
    [
      state,
      saving,
      docById,
      selectDoc,
      createDraft,
      deleteDraft,
      restoreDraft,
      updateDraftBody,
      setDraftTitle,
      updateRepoFileBody,
      attachDraft,
      addRepo,
      setExpanded,
      toggleExpanded,
      setPageTint,
    ],
  );

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
