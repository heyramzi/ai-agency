/**
 * Where a skill was found, which is not the same as where it lives. A skill
 * discovered at `~/.claude/skills/foo` whose real path is inside a checkout is
 * a project skill wearing a personal costume: `origin` records the shelf, and
 * `repo` records the home.
 */
export type Origin = "project" | "personal" | "plugin";

export type Located = {
  /** The path the walk arrived at, symlinks and all. */
  path: string;
  /** `path` with every symlink resolved. Identity is realPath, never path. */
  realPath: string;
  /** The `skills/` directory this was found under. */
  root: string;
  origin: Origin;
  /** True when any segment between root and path was a link. */
  viaSymlink: boolean;
  /** Git worktree containing realPath, or null when the file lives nowhere. */
  repo: string | null;
};

export type Frontmatter = {
  name?: unknown;
  description?: unknown;
  license?: unknown;
  compatibility?: unknown;
  metadata?: unknown;
  "allowed-tools"?: unknown;
  [key: string]: unknown;
};

export type Skill = Located & {
  /** Directory holding SKILL.md. Its basename must equal `name`. */
  dir: string;
  frontmatter: Frontmatter;
  /** null when the file has no parseable frontmatter block at all. */
  raw: string | null;
  body: string;
  bodyLines: number;
  /** sha256 of the whole file, for spotting copies that should be one source. */
  hash: string;
  /** Parse failure, if the YAML block was present and unrecoverable. */
  parseError: string | null;
  /** True when strict YAML rejected the block and a forgiving read rescued it. */
  lenient: boolean;
};

export type Severity = "error" | "warn";

export type Finding = {
  /** Stable machine code, e.g. "name-dir-mismatch". */
  code: string;
  severity: Severity;
  message: string;
  /** Real paths this finding is about. More than one for registry conflicts. */
  paths: string[];
  /** Set when `skill-cleaner fix` can repair this without a judgment call. */
  fixable?: boolean;
};

export type Report = {
  scanned: string[];
  skills: Skill[];
  findings: Finding[];
};
