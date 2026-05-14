import { useMemo, useState } from 'react';
import { useStore } from '../store';
import type { Draft, Repo, RepoFile, RepoId } from '../types';
import {
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
  RepoIcon,
  SearchIcon,
} from './icons';

interface SidebarProps {
  onOpenAddRepo: () => void;
}

export function Sidebar({ onOpenAddRepo }: SidebarProps) {
  const { state, selectDoc, createDraft, toggleExpanded } = useStore();
  const [query, setQuery] = useState('');

  const unattachedDrafts = useMemo(
    () => state.drafts.filter((d) => d.attachedRepo === null),
    [state.drafts],
  );

  const matches = (s: string) => s.toLowerCase().includes(query.toLowerCase());
  const filterDraft = (d: Draft) => !query || matches(d.title) || matches(d.md);
  const filterRepoFile = (f: RepoFile) =>
    !query || matches(f.name) || matches(f.md);

  const visibleUnattached = unattachedDrafts.filter(filterDraft);

  return (
    <aside className="sidebar">
      <div className="sidebar-top-bar">
        <div className="traffic">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <nav className="nav">
        <NavSection
          sectionKey="unattached"
          title="Unattached drafts"
          expanded={!!state.expanded['unattached']}
          onToggle={() => toggleExpanded('unattached')}
          onCreateDraft={() => createDraft('unattached')}
          count={visibleUnattached.length}
        >
          {visibleUnattached.map((d) => (
            <DraftRow
              key={d.id}
              draft={d}
              depth={1}
              selected={state.selectedDocId === d.id}
              onSelect={() => selectDoc(d.id)}
            />
          ))}
        </NavSection>

        {state.repos.map((repo) => (
          <RepoSection
            key={repo.id}
            repo={repo}
            filterDraft={filterDraft}
            filterRepoFile={filterRepoFile}
          />
        ))}
      </nav>

      <button className="sidebar-footer" onClick={onOpenAddRepo}>
        <PlusIcon size={14} />
        <span>Add repo</span>
      </button>
    </aside>
  );
}

function Collapse({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`nav-collapse${open ? '' : ' is-closed'}`}
      aria-hidden={!open}
    >
      <div className="nav-collapse-inner">{children}</div>
    </div>
  );
}

interface NavSectionProps {
  sectionKey: string;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  onCreateDraft: () => void;
  count: number;
  children?: React.ReactNode;
}

function NavSection({
  title,
  expanded,
  onToggle,
  onCreateDraft,
  count,
  children,
}: NavSectionProps) {
  return (
    <div className="nav-section">
      <div className="nav-title" onClick={onToggle}>
        <span className="nav-icon">
          <RepoIcon />
        </span>
        <span className="nav-label">{title}</span>
        <span className={`nav-count${expanded ? ' is-hidden' : ''}`}>
          {count}
        </span>
        <button
          className="nav-action"
          title={`New draft in ${title}`}
          onClick={(e) => {
            e.stopPropagation();
            onCreateDraft();
          }}
        >
          <PlusIcon />
        </button>
      </div>
      <Collapse open={expanded}>{children}</Collapse>
    </div>
  );
}

function DraftRow({
  draft,
  depth,
  selected,
  onSelect,
}: {
  draft: Draft;
  depth: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`nav-row depth-${depth}${selected ? ' selected' : ''}`}
      onClick={onSelect}
    >
      <span className="nav-icon">
        <FileIcon />
      </span>
      <span className="nav-label">{draft.title || 'Untitled draft'}</span>
    </div>
  );
}

function RepoSection({
  repo,
  filterDraft,
  filterRepoFile,
}: {
  repo: Repo;
  filterDraft: (d: Draft) => boolean;
  filterRepoFile: (f: RepoFile) => boolean;
}) {
  const { state, createDraft, toggleExpanded, setExpanded, selectDoc } =
    useStore();
  const expanded = !!state.expanded[repo.id];
  const draftsForRepo = state.drafts.filter((d) => d.attachedRepo === repo.id);
  const filesForRepo = state.repoFiles.filter((f) => f.repoId === repo.id);

  const draftsKey = `drafts:${repo.id}`;
  // Default expanded when the key has never been set.
  const draftsExpanded = state.expanded[draftsKey] !== false;
  const filteredDrafts = draftsForRepo.filter(filterDraft);
  const filteredFiles = filesForRepo.filter(filterRepoFile);

  // Counts always reflect what's actually visible (filtered + md-only),
  // so the badge and the rendered rows agree under a search query.
  const repoMdCount =
    filteredDrafts.length + filteredFiles.filter((f) => f.isMarkdown).length;

  const hasMdFiles = filteredFiles.some((f) => f.isMarkdown);

  return (
    <NavSection
      sectionKey={repo.id}
      title={repo.name}
      expanded={expanded}
      onToggle={() => toggleExpanded(repo.id)}
      onCreateDraft={() => createDraft(repo.id)}
      count={repoMdCount}
    >
      {hasMdFiles && <RepoFileTree repoId={repo.id} files={filteredFiles} />}
      {filteredDrafts.length > 0 && <div className="nav-divider" />}
      {filteredDrafts.length > 0 && (
        <>
          <div
            className="nav-row folder depth-1"
            onClick={() => setExpanded(draftsKey, !draftsExpanded)}
          >
            <span className="nav-icon">
              {draftsExpanded ? <FolderOpenIcon /> : <FolderIcon size={13} />}
            </span>
            <span className="nav-label">drafts</span>
            <span className={`nav-count${draftsExpanded ? ' is-hidden' : ''}`}>
              {filteredDrafts.length}
            </span>
          </div>
          <Collapse open={draftsExpanded}>
            {filteredDrafts.map((d) => (
              <DraftRow
                key={d.id}
                draft={d}
                depth={2}
                selected={state.selectedDocId === d.id}
                onSelect={() => selectDoc(d.id)}
              />
            ))}
          </Collapse>
        </>
      )}
    </NavSection>
  );
}

interface TreeNode {
  name: string;
  /** Full folder path including trailing slash, or '' for root. */
  path: string;
  files: RepoFile[];
  children: TreeNode[];
}

/** Normalize a folder path to '' (root) or 'a/b/'. Defensive against missing
 *  trailing slashes or leading slashes in the input data. */
function normalizePath(raw: string): string {
  if (!raw) return '';
  let p = raw.replace(/^\/+/, '');
  if (!p.endsWith('/')) p += '/';
  return p;
}

function buildTree(files: RepoFile[]): TreeNode {
  const root: TreeNode = { name: '', path: '', files: [], children: [] };
  const folderMap = new Map<string, TreeNode>();
  folderMap.set('', root);

  const ensureFolder = (rawPath: string): TreeNode => {
    const path = normalizePath(rawPath);
    if (folderMap.has(path)) return folderMap.get(path)!;
    const segs = path.replace(/\/$/, '').split('/');
    const name = segs[segs.length - 1];
    const parentPath = segs.slice(0, -1).join('/');
    const parentKey = parentPath ? parentPath + '/' : '';
    const parent = ensureFolder(parentKey);
    const node: TreeNode = { name, path, files: [], children: [] };
    parent.children.push(node);
    folderMap.set(path, node);
    return node;
  };

  for (const f of files) {
    const folder = ensureFolder(f.path);
    folder.files.push(f);
  }

  const sortNode = (n: TreeNode) => {
    n.files.sort((a, b) => a.name.localeCompare(b.name));
    n.children.sort((a, b) => a.name.localeCompare(b.name));
    n.children.forEach(sortNode);
  };
  sortNode(root);
  return root;
}

function countMdFiles(node: TreeNode): number {
  const here = node.files.filter((f) => f.isMarkdown).length;
  let sub = 0;
  for (const c of node.children) sub += countMdFiles(c);
  return here + sub;
}

function RepoFileTree({
  repoId,
  files,
}: {
  repoId: RepoId;
  files: RepoFile[];
}) {
  const tree = useMemo(() => buildTree(files), [files]);
  return <TreeChildren node={tree} repoId={repoId} depth={1} />;
}

function TreeChildren({
  node,
  repoId,
  depth,
}: {
  node: TreeNode;
  repoId: RepoId;
  depth: number;
}) {
  // Md files first, then folders. Non-md files are hidden entirely;
  // folders with no md descendants are also hidden.
  const mdFiles = node.files.filter((f) => f.isMarkdown);
  const visibleChildren = node.children.filter((c) => countMdFiles(c) > 0);
  return (
    <>
      {mdFiles.map((f) => (
        <MdFileRow key={f.id} file={f} depth={depth} />
      ))}
      {visibleChildren.map((child) => (
        <FolderNode
          key={child.path}
          node={child}
          repoId={repoId}
          depth={depth}
        />
      ))}
    </>
  );
}

function FolderNode({
  node,
  repoId,
  depth,
}: {
  node: TreeNode;
  repoId: RepoId;
  depth: number;
}) {
  const { state, toggleExpanded } = useStore();
  const key = `folder:${repoId}:${node.path}`;
  const expanded = !!state.expanded[key];
  const count = countMdFiles(node);
  return (
    <>
      <div
        className={`nav-row folder depth-${depth}`}
        onClick={() => toggleExpanded(key)}
      >
        <span className="nav-icon">
          {expanded ? <FolderOpenIcon /> : <FolderIcon size={13} />}
        </span>
        <span className="nav-label">{node.name}</span>
        <span className={`nav-count${expanded ? ' is-hidden' : ''}`}>
          {count}
        </span>
      </div>
      <Collapse open={expanded}>
        <TreeChildren node={node} repoId={repoId} depth={depth + 1} />
      </Collapse>
    </>
  );
}

function MdFileRow({ file, depth }: { file: RepoFile; depth: number }) {
  const { state, selectDoc } = useStore();
  const selected = state.selectedDocId === file.id;
  return (
    <div
      className={`nav-row depth-${depth}${selected ? ' selected' : ''}`}
      onClick={() => selectDoc(file.id)}
    >
      <span className="nav-icon">
        <FileIcon />
      </span>
      <span className="nav-label">{file.name}</span>
    </div>
  );
}
