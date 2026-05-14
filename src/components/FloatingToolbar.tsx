import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

interface Props {
  editorRef: RefObject<HTMLDivElement | null>;
  /** Called after a formatting action mutates the DOM. */
  onCommit: () => void;
  /** True when in preview mode — toolbar only shows there. */
  enabled: boolean;
}

interface Pos {
  top: number;
  left: number;
}

type BlockTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote';

function selectionIsInside(editor: HTMLElement | null): Range | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!editor || !editor.contains(range.commonAncestorContainer)) return null;
  return range;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function findAncestor(
  node: Node | null,
  tagName: string,
  stopAt: HTMLElement | null,
): HTMLElement | null {
  const tag = tagName.toLowerCase();
  let n: Node | null = node;
  while (n && n !== stopAt) {
    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement;
      if (el.tagName.toLowerCase() === tag) return el;
    }
    n = n.parentNode;
  }
  return null;
}

export function FloatingToolbar({ editorRef, onCommit, enabled }: Props) {
  const [pos, setPos] = useState<Pos | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const recompute = () => {
    if (!enabled) {
      setPos(null);
      return;
    }
    const range = selectionIsInside(editorRef.current);
    if (!range) {
      setPos(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    // Fall back to caret rect if selection rect is empty (e.g. across line break).
    const r = rect.width === 0 && rect.height === 0
      ? range.getClientRects()[0]
      : rect;
    if (!r) {
      setPos(null);
      return;
    }
    setPos({
      top: r.top - 8,
      left: r.left + r.width / 2,
    });
  };

  useEffect(() => {
    if (!enabled) {
      setPos(null);
      return;
    }
    const onSel = () => recompute();
    const onScroll = () => recompute();
    document.addEventListener('selectionchange', onSel);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('selectionchange', onSel);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Keep within viewport after render.
  useLayoutEffect(() => {
    if (!pos || !toolbarRef.current) return;
    const el = toolbarRef.current;
    const r = el.getBoundingClientRect();
    const margin = 8;
    let nextLeft = pos.left;
    const half = r.width / 2;
    if (nextLeft - half < margin) nextLeft = margin + half;
    if (nextLeft + half > window.innerWidth - margin) {
      nextLeft = window.innerWidth - margin - half;
    }
    if (nextLeft !== pos.left) {
      setPos({ ...pos, left: nextLeft });
    }
  }, [pos]);

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    onCommit();
  };

  const setBlock = (tag: BlockTag) => {
    // formatBlock applies a block tag to the paragraph containing the selection.
    exec('formatBlock', tag);
  };

  /** Toggle wrap. Uses execCommand('insertHTML') so the op lands in the
      browser's native undo stack (Cmd+Z). */
  const toggleWrap = (tag: 'code' | 'pre') => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const existing =
      findAncestor(range.startContainer, tag, editor) ??
      findAncestor(range.endContainer, tag, editor);

    if (existing) {
      // Unwrap: select the whole wrapper, replace with its text content.
      const text = existing.textContent ?? '';
      const wrapperRange = document.createRange();
      wrapperRange.selectNode(existing);
      sel.removeAllRanges();
      sel.addRange(wrapperRange);
      if (tag === 'pre') {
        document.execCommand(
          'insertHTML',
          false,
          `<p>${escapeHtml(text) || '<br>'}</p>`,
        );
      } else {
        document.execCommand('insertHTML', false, escapeHtml(text));
      }
    } else {
      if (sel.isCollapsed) return;
      const text = range.toString();
      const html =
        tag === 'pre'
          ? `<pre><code>${escapeHtml(text) || '<br>'}</code></pre>`
          : `<code>${escapeHtml(text)}</code>`;
      document.execCommand('insertHTML', false, html);
    }
    onCommit();
  };

  const addLink = () => {
    const url = window.prompt('Link URL');
    if (!url) return;
    exec('createLink', url);
  };

  if (!enabled || !pos) return null;

  // Prevent mousedown from clearing the editor selection.
  const swallow = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar"
      style={{
        top: pos.top,
        left: pos.left,
      }}
      onMouseDown={swallow}
    >
      <button onClick={() => setBlock('h1')} title="Heading 1">H1</button>
      <button onClick={() => setBlock('h2')} title="Heading 2">H2</button>
      <button onClick={() => setBlock('h3')} title="Heading 3">H3</button>
      <button onClick={() => setBlock('h4')} title="Heading 4">H4</button>
      <button onClick={() => setBlock('p')} title="Paragraph">¶</button>
      <span className="ft-sep" />
      <button onClick={() => exec('bold')} title="Bold (⌘B)">
        <b>B</b>
      </button>
      <button onClick={() => exec('italic')} title="Italic (⌘I)">
        <i>I</i>
      </button>
      <button onClick={() => exec('strikeThrough')} title="Strikethrough">
        <s>S</s>
      </button>
      <button onClick={() => toggleWrap('code')} title="Inline code">
        <code>{'<>'}</code>
      </button>
      <span className="ft-sep" />
      <button onClick={() => exec('insertUnorderedList')} title="Bulleted list">•</button>
      <button onClick={() => exec('insertOrderedList')} title="Numbered list">1.</button>
      <button onClick={() => setBlock('blockquote')} title="Blockquote">&ldquo;</button>
      <button onClick={() => toggleWrap('pre')} title="Code block">{'{ }'}</button>
      <span className="ft-sep" />
      <button onClick={addLink} title="Link">🔗</button>
    </div>
  );
}
