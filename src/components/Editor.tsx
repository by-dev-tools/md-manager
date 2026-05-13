import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useStore } from '../store';
import type { Doc, Draft, RepoFile, ViewMode } from '../types';
import { mdToHtml } from '../lib/markdown';
import { AttachIcon, DotsIcon } from './icons';
import { AttachPopover } from './AttachPopover';

interface EditorProps {
  doc: Doc | null;
  onOpenOverflow: () => void;
}

function positionCursorAtStart(node: Node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(true);
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

function updateEmptyState(el: HTMLDivElement) {
  const empty = (el.textContent || '').trim() === '';
  el.classList.toggle('is-empty', empty);
}

export function Editor({ doc, onOpenOverflow }: EditorProps) {
  const { updateDraftBody, updateRepoFileBody, setDraftTitle, saving } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [attachOpen, setAttachOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const docIdRef = useRef<string | null>(null);
  const lastViewModeRef = useRef<ViewMode>('preview');

  // When the doc or view mode changes, render fresh content into the
  // contenteditable. The editor is otherwise uncontrolled — we never sync
  // content back from React state into the DOM on every keystroke.
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el || !doc) return;
    const docChanged = docIdRef.current !== doc.id;
    const viewChanged = lastViewModeRef.current !== viewMode;
    docIdRef.current = doc.id;
    lastViewModeRef.current = viewMode;

    el.classList.toggle('markdown-mode', viewMode === 'markdown');

    if (!docChanged && !viewChanged) {
      updateEmptyState(el);
      return;
    }

    const md = doc.md;
    const isEmptyDraft = doc.kind === 'draft' && md === '';

    if (isEmptyDraft && viewMode === 'preview') {
      el.innerHTML = '<h1><br></h1>';
      updateEmptyState(el);
      if (docChanged) {
        el.focus();
        const h1 = el.querySelector('h1');
        if (h1) positionCursorAtStart(h1);
      }
      return;
    }

    if (viewMode === 'preview') {
      el.innerHTML = mdToHtml(md);
    } else {
      el.textContent = md;
    }
    updateEmptyState(el);
    if (docChanged) {
      el.focus();
      positionCursorAtStart(el);
    }
  }, [doc, viewMode]);

  useEffect(() => {
    setViewMode('preview');
    setAttachOpen(false);
  }, [doc?.id]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el || !doc) return;
    const h1 = el.querySelector('h1');
    if (h1 && h1.textContent && h1.textContent.length > 0) {
      h1.querySelectorAll('br').forEach((br) => {
        if (br.previousSibling || br.nextSibling) return;
        br.remove();
      });
    }
    updateEmptyState(el);

    if (viewMode === 'markdown') {
      const md = el.textContent ?? '';
      if (doc.kind === 'draft') updateDraftBody(doc.id, md);
      else updateRepoFileBody(doc.id, md);
      return;
    }

    // Preview mode: do not round-trip HTML→Markdown. Keep the sidebar title
    // in sync from the first non-empty visible line, and seed the markdown
    // source with `# title` for a brand-new empty draft.
    if (doc.kind === 'draft') {
      const firstLine =
        (el.textContent ?? '')
          .split('\n')
          .map((l) => l.replace(/^#+\s*/, '').trim())
          .find((l) => l) ?? '';
      if (doc.md === '' && firstLine) {
        updateDraftBody(doc.id, '# ' + firstLine);
      } else if (firstLine) {
        setDraftTitle(doc.id, firstLine);
      }
    }
  }, [doc, viewMode, updateDraftBody, updateRepoFileBody, setDraftTitle]);

  const placeholder = useMemo(() => {
    if (!doc) return 'Untitled draft';
    if (doc.kind === 'draft' && doc.md === '') return 'Untitled draft';
    return doc.kind === 'draft' ? doc.title : doc.name;
  }, [doc]);

  if (!doc) {
    return (
      <div className="editor-wrap">
        <div className="editor" />
      </div>
    );
  }

  return (
    <>
      <EditorHeader
        doc={doc}
        viewMode={viewMode}
        setViewMode={(v) => {
          const el = editorRef.current;
          if (el && viewMode === 'markdown') {
            const md = el.textContent ?? '';
            if (doc.kind === 'draft') updateDraftBody(doc.id, md);
            else updateRepoFileBody(doc.id, md);
          }
          setViewMode(v);
        }}
        attachOpen={attachOpen}
        onToggleAttach={() => setAttachOpen((v) => !v)}
        onCloseAttach={() => setAttachOpen(false)}
        onOpenOverflow={onOpenOverflow}
        saving={saving}
      />
      <div className="editor-wrap">
        <div
          ref={editorRef}
          className="editor"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={handleInput}
        />
      </div>
    </>
  );
}

interface HeaderProps {
  doc: Doc;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  attachOpen: boolean;
  onToggleAttach: () => void;
  onCloseAttach: () => void;
  onOpenOverflow: () => void;
  saving: boolean;
}

function EditorHeader({
  doc,
  viewMode,
  setViewMode,
  attachOpen,
  onToggleAttach,
  onCloseAttach,
  onOpenOverflow,
  saving,
}: HeaderProps) {
  const { state } = useStore();

  return (
    <div className="editor-header">
      <div className="crumb">
        {doc.kind === 'draft' ? (
          <DraftCrumb doc={doc} onToggleAttach={onToggleAttach} repos={state.repos} />
        ) : (
          <RepoFileCrumb
            doc={doc}
            repoName={state.repos.find((r) => r.id === doc.repoId)?.name ?? doc.repoId}
          />
        )}
      </div>
      <div className="segmented">
        <button
          className={viewMode === 'preview' ? 'active' : ''}
          onClick={() => setViewMode('preview')}
        >
          Preview
        </button>
        <button
          className={viewMode === 'markdown' ? 'active' : ''}
          onClick={() => setViewMode('markdown')}
        >
          Markdown
        </button>
      </div>
      <div className="editor-actions">
        <span className="saved">{saving ? 'Saving…' : 'Saved'}</span>
        <button title="More" onClick={onOpenOverflow}>
          <DotsIcon />
        </button>
      </div>
      {attachOpen && doc.kind === 'draft' && (
        <AttachPopover draft={doc} onClose={onCloseAttach} />
      )}
    </div>
  );
}

function DraftCrumb({
  doc,
  onToggleAttach,
  repos,
}: {
  doc: Draft;
  onToggleAttach: () => void;
  repos: { id: string; name: string }[];
}) {
  const attached = doc.attachedRepo
    ? repos.find((r) => r.id === doc.attachedRepo)
    : null;
  return (
    <>
      <span className="tag">
        <span className="tag-dot" />
        Draft
      </span>
      <button
        className={`attach-chip${attached ? ' attached' : ''}`}
        onClick={onToggleAttach}
      >
        <AttachIcon />
        <span>{attached ? attached.name : 'Attach to repo'}</span>
      </button>
    </>
  );
}

function RepoFileCrumb({ doc, repoName }: { doc: RepoFile; repoName: string }) {
  return (
    <div className="attach-chip breadcrumb attached">
      <span>
        {repoName} / {doc.path}
        {doc.name}
      </span>
    </div>
  );
}
