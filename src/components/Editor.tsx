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
import { htmlToMd, mdToHtml, safeUrl } from '../lib/markdown';
import {
  AttachIcon,
  CodeIcon,
  CopyIcon,
  EyeIcon,
  PanelLeftIcon,
  TrashIcon,
} from './icons';
import { AttachPopover } from './AttachPopover';
import { FloatingToolbar } from './FloatingToolbar';
import { useToast } from './Toast';

interface EditorProps {
  doc: Doc | null;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

function updateEmptyState(el: HTMLDivElement) {
  const empty = (el.textContent || '').trim() === '';
  el.classList.toggle('is-empty', empty);
}

export function Editor({ doc, sidebarCollapsed, onToggleSidebar }: EditorProps) {
  const { updateDraftBody, updateRepoFileBody, deleteDraft, restoreDraft, saving } =
    useStore();
  const toast = useToast();
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
      return;
    }

    if (viewMode === 'preview') {
      el.innerHTML = mdToHtml(md);
    } else {
      el.textContent = md;
    }
    updateEmptyState(el);
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

    // Preview mode: round-trip the contenteditable DOM back to markdown so
    // formatting toolbar actions and direct edits persist.
    const md = htmlToMd(el.innerHTML);
    if (doc.kind === 'draft') updateDraftBody(doc.id, md);
    else updateRepoFileBody(doc.id, md);
  }, [doc, viewMode, updateDraftBody, updateRepoFileBody]);

  const commitFromToolbar = useCallback(() => {
    // execCommand mutates the DOM directly and doesn't fire input events
    // in every browser; nudge the input handler manually.
    handleInput();
  }, [handleInput]);

  // ⌘/Ctrl-click on a link in preview mode opens the URL in a new tab. Plain
  // click stays as caret-placement so authoring isn't disrupted. The mdToHtml
  // path already filters unsafe schemes; we re-run safeUrl() here as a defense
  // in depth in case content was pasted in a way that bypassed the renderer.
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (viewMode !== 'preview') return;
      if (!(e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute('href') ?? '';
      const safe = safeUrl(href);
      if (safe === '#') return;
      e.preventDefault();
      window.open(safe, '_blank', 'noopener,noreferrer');
    },
    [viewMode],
  );

  // ArrowRight at the end of an inline <code> element should escape the code
  // wrapper instead of leaving the caret stuck at its boundary (where typing
  // continues inside the code). Place the caret just after </code>.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight') return;
    if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || !sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;
    if (node.nodeType !== Node.TEXT_NODE) return;
    if (offset !== (node.textContent?.length ?? 0)) return;

    // Find an enclosing <code> ancestor (excluding code inside <pre> blocks).
    let codeEl: HTMLElement | null = null;
    let n: Node | null = node.parentNode;
    while (n && n !== editor) {
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (tag === 'pre') return;
        if (tag === 'code') {
          codeEl = el;
          break;
        }
      }
      n = n.parentNode;
    }
    if (!codeEl) return;

    // Confirm the caret really is at the trailing edge of the code element.
    let walker: Node = node;
    while (walker !== codeEl) {
      if (walker.nextSibling) return;
      const parent = walker.parentNode;
      if (!parent) return;
      walker = parent;
    }

    e.preventDefault();
    const newRange = document.createRange();
    newRange.setStartAfter(codeEl);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }, []);

  const placeholder = useMemo(() => {
    if (!doc) return 'Untitled draft';
    if (doc.kind === 'draft' && doc.md === '') return 'Untitled draft';
    return doc.kind === 'draft' ? doc.title : doc.name;
  }, [doc]);

  if (!doc) {
    return (
      <>
        <div className="editor-header">
          <SidebarToggle
            collapsed={sidebarCollapsed}
            onToggle={onToggleSidebar}
          />
        </div>
        <div className="editor-wrap">
          <div className="editor" />
        </div>
      </>
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
        saving={saving}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        onCopy={() => {
          void navigator.clipboard?.writeText(doc.md);
          toast.push({ message: 'Markdown copied' });
        }}
        onDelete={
          doc.kind === 'draft'
            ? () => {
                const removed = deleteDraft(doc.id);
                if (!removed) return;
                toast.push({
                  message: 'Draft deleted',
                  action: {
                    label: 'Undo',
                    onClick: () => restoreDraft(removed),
                  },
                });
              }
            : undefined
        }
      />
      <div className="editor-wrap">
        <div
          ref={editorRef}
          className="editor"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
        />
      </div>
      <FloatingToolbar
        editorRef={editorRef}
        onCommit={commitFromToolbar}
        enabled={viewMode === 'preview'}
      />
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
  saving: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onCopy: () => void;
  onDelete?: () => void;
}

function EditorHeader({
  doc,
  viewMode,
  setViewMode,
  attachOpen,
  onToggleAttach,
  onCloseAttach,
  saving,
  sidebarCollapsed,
  onToggleSidebar,
  onCopy,
  onDelete,
}: HeaderProps) {
  const { state } = useStore();

  return (
    <div className="editor-header">
      <SidebarToggle collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
      <div className="crumb">
        {doc.kind === 'draft' ? (
          <DraftCrumb />
        ) : (
          <RepoFileCrumb
            doc={doc}
            repoName={state.repos.find((r) => r.id === doc.repoId)?.name ?? doc.repoId}
          />
        )}
        <span className="saved">{saving ? 'Saving…' : 'Saved'}</span>
        <button
          className="header-icon-btn"
          title="Copy markdown"
          aria-label="Copy markdown"
          onClick={onCopy}
        >
          <CopyIcon />
        </button>
        {onDelete && (
          <button
            className="header-icon-btn"
            title="Delete draft"
            aria-label="Delete draft"
            onClick={onDelete}
          >
            <TrashIcon />
          </button>
        )}
      </div>
      <div className="segmented">
        <button
          className={viewMode === 'preview' ? 'active' : ''}
          onClick={() => setViewMode('preview')}
          title="Preview"
          aria-label="Preview"
        >
          <EyeIcon />
        </button>
        <button
          className={viewMode === 'markdown' ? 'active' : ''}
          onClick={() => setViewMode('markdown')}
          title="Markdown"
          aria-label="Markdown"
        >
          <CodeIcon />
        </button>
      </div>
      {doc.kind === 'draft' && (
        <AttachButton doc={doc} repos={state.repos} onToggle={onToggleAttach} />
      )}
      {attachOpen && doc.kind === 'draft' && (
        <AttachPopover draft={doc} onClose={onCloseAttach} />
      )}
    </div>
  );
}

function SidebarToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`sidebar-toggle${collapsed ? ' is-collapsed' : ''}`}
      title={collapsed ? 'Show sidebar (⌘\\)' : 'Hide sidebar (⌘\\)'}
      aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
      onClick={onToggle}
    >
      <PanelLeftIcon />
    </button>
  );
}

function DraftCrumb() {
  return (
    <span className="tag">
      <span className="tag-dot" />
      Draft
    </span>
  );
}

function AttachButton({
  doc,
  repos,
  onToggle,
}: {
  doc: Draft;
  repos: { id: string; name: string }[];
  onToggle: () => void;
}) {
  const attached = doc.attachedRepo
    ? repos.find((r) => r.id === doc.attachedRepo)
    : null;
  return (
    <button
      className={`attach-chip${attached ? ' attached' : ''}`}
      onClick={onToggle}
    >
      <AttachIcon />
      <span>{attached ? attached.name : 'Attach to repo'}</span>
    </button>
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
