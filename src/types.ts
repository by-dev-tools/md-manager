export type DraftId = string;
export type RepoId = string;
export type RepoFileId = string;
export type DocId = DraftId | RepoFileId;

export interface Draft {
  id: DraftId;
  kind: 'draft';
  title: string;
  md: string;
  attachedRepo: RepoId | null;
  createdAt: number;
  updatedAt: number;
}

export interface RepoFile {
  id: RepoFileId;
  kind: 'repo-file';
  repoId: RepoId;
  /** Folder path inside the repo, with trailing slash. Empty string for root. */
  path: string;
  /** File name including extension. */
  name: string;
  /** Whether to render in the file tree at all (always true in v1). */
  isMarkdown: boolean;
  md: string;
}

export interface Repo {
  id: RepoId;
  name: string;
  /** Optional local path or GitHub URL the user supplied. */
  source: string | null;
}

export type Doc = Draft | RepoFile;

export type ViewMode = 'preview' | 'markdown';
export type SurfaceMode = 'floating' | 'flat';
