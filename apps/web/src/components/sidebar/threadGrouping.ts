export type ThreadGroupingMode = "flat" | "project" | "worktree";

interface GroupableThread {
  environmentId: string;
  projectId: string;
  worktreePath: string | null;
  branch: string | null;
}

export interface SidebarThreadGroup<T> {
  key: string;
  label: string;
  detail: string | null;
  threads: T[];
  worktrees: SidebarThreadGroup<T>[];
}

export function groupSidebarThreads<T extends GroupableThread>(
  threads: readonly T[],
  projectFor: (thread: T) => { key: string; label: string },
  environmentLabel: (id: string) => string,
): SidebarThreadGroup<T>[] {
  const projects = new Map<string, SidebarThreadGroup<T>>();
  const worktrees = new Map<string, SidebarThreadGroup<T>>();
  for (const thread of threads) {
    const project = projectFor(thread);
    let group = projects.get(project.key);
    if (!group) {
      group = { ...project, detail: null, threads: [], worktrees: [] };
      projects.set(project.key, group);
    }
    group.threads.push(thread);
    // Branch names are mutable and can be shared by different checkouts or machines.
    const key = JSON.stringify([
      project.key,
      thread.environmentId,
      thread.projectId,
      thread.worktreePath,
    ]);
    let worktree = worktrees.get(key);
    if (!worktree) {
      const path = thread.worktreePath?.replaceAll("\\", "/").replace(/\/+$/, "");
      worktree = {
        key,
        label: path ? (path.split("/").at(-1) ?? path) : "Main checkout",
        detail: [thread.branch, environmentLabel(thread.environmentId)].filter(Boolean).join(" · "),
        threads: [],
        worktrees: [],
      };
      worktrees.set(key, worktree);
      group.worktrees.push(worktree);
    }
    worktree.threads.push(thread);
  }
  return [...projects.values()];
}

export function sidebarGroupKey(section: string, groupKey: string): string {
  return JSON.stringify([section, groupKey]);
}

export function visibleGroupedThreads<T>(
  groups: readonly SidebarThreadGroup<T>[],
  mode: Exclude<ThreadGroupingMode, "flat">,
  section: string,
  collapsed: ReadonlySet<string>,
): T[] {
  return groups.flatMap((group) => {
    if (collapsed.has(sidebarGroupKey(section, group.key))) return [];
    return mode === "project"
      ? group.threads
      : group.worktrees.flatMap((worktree) =>
          collapsed.has(sidebarGroupKey(section, worktree.key)) ? [] : worktree.threads,
        );
  });
}
