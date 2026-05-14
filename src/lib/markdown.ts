function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escape only the characters that matter inside a double-quoted attribute,
    on a string that has already been through escapeHtml. Avoids double-encoding. */
function escapeQuotes(s: string): string {
  return s.replace(/"/g, '&quot;');
}

/** SAFETY: allow only schemes that can't execute script. Anything that doesn't
    match returns '#' so the rendered link is inert. javascript:, data:, vbscript:,
    file:, etc. are all rejected by this allowlist.

    Whitespace and control characters anywhere before the scheme separator
    cause rejection too — browsers normalize whitespace inside hrefs (e.g.
    `java\tscript:` resolves to `javascript:`), so any pre-colon whitespace is
    a tampering signal. */
export function safeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '#';
  // Reject any whitespace before the first colon. Browsers strip these when
  // resolving the scheme, so `java\tscript:` would be treated as `javascript:`.
  // Only applied when there IS a colon — a relative path with no colon
  // (`/path/with space.md`, `#section heading`) may legitimately contain
  // spaces and should not be rejected.
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx >= 0 && /\s/.test(trimmed.slice(0, colonIdx))) return '#';
  // Protocol-relative URLs (`//example.com/path`) are treated as https.
  // Check this BEFORE the generic `/`-prefix branch below.
  if (trimmed.startsWith('//')) return 'https:' + trimmed;
  // Relative path or fragment is safe.
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('?') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return trimmed;
  }
  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  if (!schemeMatch) {
    // No scheme — treat as relative path.
    return trimmed;
  }
  const scheme = schemeMatch[1].toLowerCase();
  if (scheme === 'http' || scheme === 'https' || scheme === 'mailto') {
    return trimmed;
  }
  return '#';
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, label, href) =>
        // target="_blank" gives screen-reader announcement of "opens in a
        // new tab" and matches the ⌘-click handler's behavior so the cue
        // doesn't lie. rel="noopener noreferrer" keeps the new window
        // sandboxed.
        `<a href="${escapeQuotes(safeUrl(href))}" target="_blank" rel="noopener noreferrer" title="⌘-click to open">${label}</a>`,
    );
}

export function mdToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let listKind: 'ul' | 'ol' | null = null;
  let inQuote = false;
  let inCode = false;
  const codeBuf: string[] = [];

  const closeList = () => {
    if (listKind) {
      out.push(`</${listKind}>`);
      listKind = null;
    }
  };
  const closeQuote = () => {
    if (inQuote) {
      out.push('</blockquote>');
      inQuote = false;
    }
  };
  const closeAll = () => {
    closeList();
    closeQuote();
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        out.push('<pre><code>' + escapeHtml(codeBuf.join('\n')) + '</code></pre>');
        codeBuf.length = 0;
        inCode = false;
      } else {
        closeAll();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    const hMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    const ulMatch = /^[-*]\s+(.*)$/.exec(line);
    const olMatch = /^\d+\.\s+(.*)$/.exec(line);
    const quoteMatch = /^>\s?(.*)$/.exec(line);

    if (hMatch) {
      closeAll();
      const level = hMatch[1].length;
      out.push(`<h${level}>${inline(hMatch[2])}</h${level}>`);
    } else if (ulMatch) {
      closeQuote();
      if (listKind !== 'ul') {
        closeList();
        out.push('<ul>');
        listKind = 'ul';
      }
      out.push(`<li>${inline(ulMatch[1])}</li>`);
    } else if (olMatch) {
      closeQuote();
      if (listKind !== 'ol') {
        closeList();
        out.push('<ol>');
        listKind = 'ol';
      }
      out.push(`<li>${inline(olMatch[1])}</li>`);
    } else if (quoteMatch) {
      closeList();
      if (!inQuote) {
        out.push('<blockquote>');
        inQuote = true;
      }
      out.push(`<p>${inline(quoteMatch[1])}</p>`);
    } else if (line.trim() === '') {
      closeAll();
    } else {
      closeAll();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeAll();
  return out.join('\n');
}

/** Convert a DOM tree back to markdown. Tolerant of contenteditable quirks. */
function inlineToMd(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const inner = Array.from(el.childNodes).map(inlineToMd).join('');
  switch (tag) {
    case 'strong':
    case 'b':
      return inner ? `**${inner}**` : '';
    case 'em':
    case 'i':
      return inner ? `*${inner}*` : '';
    case 's':
    case 'del':
    case 'strike':
      return inner ? `~~${inner}~~` : '';
    case 'code':
      return inner ? `\`${inner}\`` : '';
    case 'a': {
      const href = el.getAttribute('href') ?? '';
      return inner ? `[${inner}](${href})` : '';
    }
    case 'br':
      return '\n';
    default:
      return inner;
  }
}

function blockToMd(node: Node): string | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent ?? '';
    return t.trim() ? t : null;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const level = parseInt(tag.slice(1), 10);
      const text = inlineToMd(el).trim();
      return '#'.repeat(level) + ' ' + text;
    }
    case 'p': {
      const text = inlineToMd(el);
      return text.trim() ? text : '';
    }
    case 'ul':
      return Array.from(el.children)
        .filter((c) => c.tagName.toLowerCase() === 'li')
        .map((li) => '- ' + inlineToMd(li).trim())
        .join('\n');
    case 'ol':
      return Array.from(el.children)
        .filter((c) => c.tagName.toLowerCase() === 'li')
        .map((li, i) => `${i + 1}. ${inlineToMd(li).trim()}`)
        .join('\n');
    case 'blockquote': {
      const inner: string[] = [];
      for (const c of Array.from(el.childNodes)) {
        const b = blockToMd(c);
        if (b !== null) inner.push(b);
      }
      const joined = inner.join('\n').trim();
      return joined
        .split('\n')
        .map((l) => '> ' + l)
        .join('\n');
    }
    case 'pre': {
      const code = el.querySelector('code');
      const text = (code?.textContent ?? el.textContent ?? '').replace(/\n+$/, '');
      return '```\n' + text + '\n```';
    }
    case 'div': {
      // Browsers often wrap lines in <div> after Enter in contenteditable.
      // Treat as a paragraph-ish container.
      const text = inlineToMd(el);
      return text.trim() ? text : '';
    }
    case 'br':
      return '';
    default: {
      const text = inlineToMd(el);
      return text.trim() ? text : null;
    }
  }
}

export function htmlToMd(html: string): string {
  if (typeof document === 'undefined') return '';
  // SAFETY: `wrapper` is a freshly-created detached <div>. Setting innerHTML
  // on a detached node does NOT fire event handlers (`<img onerror>`,
  // `<svg onload>`, etc.) and does NOT execute inserted <script> tags.
  // If you ever inline this into an attached node, this assumption breaks
  // and the input must be sanitized first.
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const blocks: string[] = [];
  for (const child of Array.from(wrapper.childNodes)) {
    const md = blockToMd(child);
    if (md === null) continue;
    blocks.push(md);
  }
  return blocks
    .map((b) => b.trim())
    .filter((b, i, arr) => !(b === '' && arr[i - 1] === ''))
    .join('\n\n')
    .trim();
}

/** Derive a title from the markdown source: first non-empty line, heading hash stripped. */
export function deriveTitle(md: string, fallback = 'Untitled draft'): string {
  for (const raw of md.split('\n')) {
    const line = raw.replace(/^#+\s*/, '').trim();
    if (line) return line.slice(0, 80);
  }
  return fallback;
}
