import { useMemo, useState } from 'react';
import { useStore } from '../store';
import type { Draft, Repo, RepoFile, RepoId } from '../types';
import {
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  PencilIcon,
  PlusIcon,
  RepoIcon,
  SearchIcon,
} from './icons';
import type { ReactNode } from 'react';

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

  const filterDraft = (d: Draft) =>
    !query || matches(d.title) || matches(d.md);
  const filterRepoFile = (f: RepoFile) =>
    !query || matches(f.name) || matches(f.md);

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
        <SourceRow
          sourceKey="unattached"
          label="Unattached drafts"
          count={unattachedDrafts.length}
          expanded={!!state.expanded['unattached']}
          iconKind="file"
          collapsible={unattachedDrafts.length > 0}
          onToggle={() => toggleExpanded('unattached')}
          onCreateDraft={() => createDraft('unattached')}
        />
        {unattachedDrafts.length > 0 && !!state.expanded['unattached'] && (
          <div className="children">
            {unattachedDrafts.filter(filterDraft).map((d) => (
              <DraftRow
                key={d.id}
                draft={d}
                selected={state.selectedDocId === d.id}
                onSelect={() => selectDoc(d.id)}
              />
            ))}
          </div>
        )}

        {state.repos.map((repo, i) => (
          <RepoSection
            key={repo.id}
            repo={repo}
            isFirst={i === 0}
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

interface SourceRowProps {
  sourceKey: string;
  label: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  onCreateDraft?: () => void;
  icon?: ReactNode;
  iconKind?: 'file' | 'folder' | 'pencil' | 'repo';
  variant?: 'primary' | 'nested';
  /** When false, the row has no chevron and doesn't expand — only the + action
      remains. Use for empty containers where expand/collapse would be a no-op. */
  collapsible?: boolean;
}

function SourceRow({
  label,
  count,
  expanded,
  onToggle,
  onCreateDraft,
  icon,
  iconKind = 'file',
  variant = 'primary',
  collapsible = true,
}: SourceRowProps) {
  const baseIcon =
    icon ??
    (iconKind === 'folder' ? (
      collapsible && expanded ? <FolderOpenIcon /> : <FolderIcon />
    ) : iconKind === 'pencil' ? (
      <PencilIcon />
    ) : iconKind === 'repo' ? (
      <RepoIcon />
    ) : (
      <FileIcon />
    ));
  const showCount =
    collapsible && !expanded && count !== undefined && count > 0;

  return (
    <div
      className={`row-top${variant === 'nested' ? ' row-nested' : ''}${
        collapsible ? '' : ' not-collapsible'
      }`}
      onClick={collapsible ? onToggle : undefined}
    >
      <span className="icon">{baseIcon}</span>
      <span className="label">{label}</span>
      {showCount && <span className="count">{count}</span>}
      {onCreateDraft && (
        <button
          className="row-action"
          title={`New draft in ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onCreateDraft();
          }}
        >
          <PlusIcon />
        </button>
      )}
    </div>
  );
}

function DraftRow({
  draft,
  selected,
  onSelect,
}: {
  draft: Draft;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`row-leaf${selected ? ' selected' : ''}`}
      onClick={onSelect}
    >
      <span className="leaf-spacer" aria-hidden />
      <span className="label">{draft.title || 'Untitled draft'}</span>
    </div>
  );
}

function RepoSection({
  repo,
  isFirst,
  filterDraft,
  filterRepoFile,
}: {
  repo: Repo;
  isFirst: boolean;
  filterDraft: (d: Draft) => boolean;
  filterRepoFile: (f: RepoFile) => boolean;
}) {
  const { state, selectDoc, createDraft, toggleExpanded } = useStore();
  const expanded = !!state.expanded[repo.id];

  const draftsForRepo = state.drafts
    .filter((d) => d.attachedRepo === repo.id)
    .filter(filterDraft);
  const filesForRepo = state.repoFiles
    .filter((f) => f.repoId === repo.id && f.isMarkdown)
    .filter(filterRepoFile);
  const hasContent = filesForRepo.length > 0 || draftsForRepo.length > 0;
  // Drafts always sit "below the line" — the hairline marks them as loose,
  // not part of the repo. So show it whenever drafts exist, even if there
  // are no files above to separate from.
  const showDivider = draftsForRepo.length > 0;

  return (
    <>
      {!isFirst ? null : <div className="group-gap" />}
      <SourceRow
        sourceKey={repo.id}
        label={repo.name}
        count={filesForRepo.length}
        expanded={expanded}
        iconKind="repo"
        collapsible={hasContent}
        onToggle={() => toggleExpanded(repo.id)}
        onCreateDraft={() => createDraft(repo.id)}
      />
      {hasContent && expanded && (
        <div className="children">
          {filesForRepo.length > 0 && (
            <div className="repo-files">
              <RepoFileTree repoId={repo.id} files={filesForRepo} />
            </div>
          )}
          {showDivider && <div className="repo-divider" aria-hidden />}
          {draftsForRepo.length > 0 && (
            <div className="repo-drafts">
              {draftsForRepo.map((d) => (
                <DraftRow
                  key={d.id}
                  draft={d}
                  selected={state.selectedDocId === d.id}
                  onSelect={() => selectDoc(d.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="group-gap" />
    </>
  );
}

interface TreeNode {
  /** Folder name segment, or empty for root. */
  name: string;
  /** Full folder path including trailing slash, or '' for root. */
  path: string;
  files: RepoFile[];
  children: TreeNode[];
}

function buildTree(files: RepoFile[]): TreeNode {
  const root: TreeNode = { name: '', path: '', files: [], children: [] };

  const folderMap = new Map<string, TreeNode>();
  folderMap.set('', root);

  const ensureFolder = (path: string): TreeNode => {
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

  // Sort: markdown files first, then dimmed; children alphabetical.
  const sortNode = (n: TreeNode) => {
    n.files.sort((a, b) => {
      if (a.isMarkdown !== b.isMarkdown) return a.isMarkdown ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    n.children.sort((a, b) => a.name.localeCompare(b.name));
    n.children.forEach(sortNode);
  };
  sortNode(root);

  return root;
}

function RepoFileTree({
  repoId,
  files,
}: {
  repoId: RepoId;
  files: RepoFile[];
}) {
  const tree = useMemo(() => buildTree(files), [files]);
  return (
    <div className="file-tree">
      <TreeChildren node={tree} repoId={repoId} />
    </div>
  );
}

function TreeChildren({ node, repoId }: { node: TreeNode; repoId: RepoId }) {
  return (
    <>
      {node.children.map((child) => (
        <FolderNode key={child.path} node={child} repoId={repoId} />
      ))}
      {node.files.map((f) => (
        <MdFileRow key={f.id} file={f} />
      ))}
    </>
  );
}

function FolderNode({ node, repoId }: { node: TreeNode; repoId: RepoId }) {
  const { state, toggleExpanded } = useStore();
  const key = `folder:${repoId}:${node.path}`;
  const expanded = !!state.expanded[key];
  return (
    <>
      <div
        className="file-row folder"
        onClick={() => toggleExpanded(key)}
      >
        <span className="file-icon">
          {expanded ? <FolderOpenIcon size={13} /> : <FolderIcon size={13} />}
        </span>
        <span className="file-name">{node.name}</span>
      </div>
      {expanded && (
        <div className="folder-children">
          <TreeChildren node={node} repoId={repoId} />
        </div>
      )}
    </>
  );
}

function MdFileRow({ file }: { file: RepoFile }) {
  const { state, selectDoc } = useStore();
  const selected = state.selectedDocId === file.id;
  return (
    <div
      className={`file-row${selected ? ' selected' : ''}`}
      onClick={() => selectDoc(file.id)}
    >
      <span className="md-badge">md</span>
      <span className="file-name">{file.name}</span>
    </div>
  );
}

