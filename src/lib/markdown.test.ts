import { describe, expect, it } from 'vitest';
import { htmlToMd, mdToHtml, safeUrl } from './markdown';

/** Round-trip: md → html → md. The output won't always match the input
    character-for-character (paragraph joins, list spacing), but each block's
    semantic content must survive. */
function roundTrip(md: string): string {
  return htmlToMd(mdToHtml(md));
}

describe('safeUrl', () => {
  it('allows http and https', () => {
    expect(safeUrl('http://example.com')).toBe('http://example.com');
    expect(safeUrl('https://example.com/x?y=1')).toBe('https://example.com/x?y=1');
  });

  it('allows mailto', () => {
    expect(safeUrl('mailto:hi@example.com')).toBe('mailto:hi@example.com');
  });

  it('treats no-scheme as relative', () => {
    expect(safeUrl('foo/bar.md')).toBe('foo/bar.md');
    expect(safeUrl('/abs/path')).toBe('/abs/path');
    expect(safeUrl('./rel')).toBe('./rel');
    expect(safeUrl('#section')).toBe('#section');
  });

  it('rejects javascript: and other dangerous schemes', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('#');
    expect(safeUrl('JaVaScRiPt:alert(1)')).toBe('#');
    expect(safeUrl('  javascript:alert(1)')).toBe('#');
    expect(safeUrl('data:text/html,<script>x</script>')).toBe('#');
    expect(safeUrl('vbscript:msgbox(1)')).toBe('#');
    expect(safeUrl('file:///etc/passwd')).toBe('#');
  });

  it('treats // as https', () => {
    expect(safeUrl('//example.com/x')).toBe('https://example.com/x');
  });

  it('returns # for empty input', () => {
    expect(safeUrl('')).toBe('#');
    expect(safeUrl('   ')).toBe('#');
  });
});

describe('mdToHtml — link sanitization', () => {
  it('produces inert href for javascript:', () => {
    const html = mdToHtml('[click](javascript:alert(1))');
    expect(html).toContain('href="#"');
    expect(html).not.toMatch(/javascript:/i);
  });

  it('preserves valid http link with rel and discoverability title', () => {
    const html = mdToHtml('[ok](https://example.com)');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    // The title teaches the user that links open on ⌘-click, not plain click.
    expect(html).toContain('title="⌘-click to open"');
  });

  it('escapes quotes in href to prevent attribute-break-out', () => {
    // The markdown parser captures up to the first close-paren, so a quote
    // in the URL still needs HTML-attribute escaping.
    const html = mdToHtml('[x](https://example.com/"onmouseover="alert(1))');
    // Either the URL is sanitized to '#' (no scheme match after quote) or the
    // quote is encoded — never raw inside an attribute.
    expect(html).not.toMatch(/"\s*onmouseover/);
  });
});

describe('htmlToMd / mdToHtml round-trip', () => {
  it('preserves a single paragraph', () => {
    expect(roundTrip('Hello world.')).toBe('Hello world.');
  });

  it('preserves heading levels h1 through h6', () => {
    for (let level = 1; level <= 6; level++) {
      const hashes = '#'.repeat(level);
      const md = `${hashes} Heading ${level}`;
      expect(roundTrip(md)).toBe(md);
    }
  });

  it('preserves bold, italic, strikethrough, inline code', () => {
    const md = '**bold** and *italic* and ~~strike~~ and `code`.';
    expect(roundTrip(md)).toBe(md);
  });

  it('preserves bulleted lists', () => {
    const md = '- one\n- two\n- three';
    expect(roundTrip(md)).toBe(md);
  });

  it('preserves numbered lists', () => {
    const md = '1. one\n2. two\n3. three';
    expect(roundTrip(md)).toBe(md);
  });

  it('preserves blockquotes', () => {
    const md = '> a quoted line\n> another quoted line';
    // Blockquote contents become a single <p>; we accept either single-line
    // or multi-line forms as long as the > prefix and content survive.
    const out = roundTrip(md);
    expect(out.split('\n').every((l) => l.startsWith('>'))).toBe(true);
    expect(out).toContain('a quoted line');
    expect(out).toContain('another quoted line');
  });

  it('preserves fenced code blocks', () => {
    const md = '```\nconst x = 1;\nconst y = 2;\n```';
    expect(roundTrip(md)).toBe(md);
  });

  it('preserves links with http URLs', () => {
    const md = 'See [the docs](https://example.com) for details.';
    expect(roundTrip(md)).toBe(md);
  });

  it('drops javascript: URLs in the round-trip', () => {
    const md = 'Click [here](javascript:alert(1))';
    const out = roundTrip(md);
    expect(out).not.toMatch(/javascript:/i);
    expect(out).toContain('[here](#)');
  });

  it('preserves mixed inline + block content', () => {
    const md = [
      '# Title',
      '',
      'Paragraph with **bold** and a [link](https://example.com).',
      '',
      '- item one',
      '- item two',
      '',
      '## Sub',
      '',
      '> a quote',
    ].join('\n');
    const out = roundTrip(md);
    expect(out).toContain('# Title');
    expect(out).toContain('## Sub');
    expect(out).toContain('**bold**');
    expect(out).toContain('[link](https://example.com)');
    expect(out).toContain('- item one');
    expect(out).toContain('- item two');
    expect(out).toMatch(/^> /m);
  });
});
