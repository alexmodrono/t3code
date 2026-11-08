import { describe, expect, it } from "vite-plus/test";
import { groupSidebarThreads, sidebarGroupKey, visibleGroupedThreads } from "./threadGrouping";

function thread(
  id: string,
  projectId = "app",
  environmentId = "local",
  worktreePath: string | null = null,
  branch = "main",
) {
  return { id, projectId, environmentId, worktreePath, branch };
}

const projectFor = (value: ReturnType<typeof thread>) => ({
  key: value.projectId,
  label: value.projectId,
});
const environmentLabel = (id: string) => id;

describe("sidebar thread grouping", () => {
  it("keeps first-seen project order and the existing order within each project", () => {
    const groups = groupSidebarThreads(
      [thread("a1"), thread("b1", "docs"), thread("a2"), thread("b2", "docs")],
      projectFor,
      environmentLabel,
    );
    expect(groups.map((group) => group.label)).toEqual(["app", "docs"]);
    expect(
      visibleGroupedThreads(groups, "project", "active", new Set()).map((value) => value.id),
    ).toEqual(["a1", "a2", "b1", "b2"]);
  });

  it("groups multiple agents by checkout, even when their saved branches differ", () => {
    const groups = groupSidebarThreads(
      [
        thread("claude", "app", "local", "/worktrees/checkout", "feature/a"),
        thread("codex", "app", "local", "/worktrees/checkout", "feature/b"),
        thread("main"),
      ],
      projectFor,
      environmentLabel,
    );
    expect(
      groups[0]?.worktrees.map((group) => [group.label, group.threads.map((value) => value.id)]),
    ).toEqual([
      ["checkout", ["claude", "codex"]],
      ["Main checkout", ["main"]],
    ]);
  });

  it("does not merge matching worktree paths or main checkouts across environments", () => {
    const groups = groupSidebarThreads(
      [
        thread("local", "app", "local", "/worktrees/task"),
        thread("remote", "app", "remote", "/worktrees/task"),
        thread("local-main"),
        thread("remote-main", "app", "remote"),
      ],
      projectFor,
      environmentLabel,
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]?.worktrees).toHaveLength(4);
    expect(groups[0]?.worktrees[1]?.detail).toBe("main · remote");
  });

  it("keeps separate physical checkouts inside a logical repository group", () => {
    const groups = groupSidebarThreads(
      [thread("one", "checkout-one"), thread("two", "checkout-two")],
      () => ({ key: "repo", label: "Repository" }),
      environmentLabel,
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]?.worktrees).toHaveLength(2);
  });

  it("excludes collapsed groups from navigation without hiding another section", () => {
    const groups = groupSidebarThreads(
      [thread("main"), thread("task", "app", "local", "/worktrees/task"), thread("docs", "docs")],
      projectFor,
      environmentLabel,
    );
    const worktree = groups[0]!.worktrees[1]!;
    const collapsed = new Set([
      sidebarGroupKey("active", worktree.key),
      sidebarGroupKey("active", "docs"),
    ]);
    expect(
      visibleGroupedThreads(groups, "worktree", "active", collapsed).map((value) => value.id),
    ).toEqual(["main"]);
    expect(
      visibleGroupedThreads(groups, "worktree", "pinned", collapsed).map((value) => value.id),
    ).toEqual(["main", "task", "docs"]);
    expect(
      visibleGroupedThreads(groups, "project", "active", collapsed).map((value) => value.id),
    ).toEqual(["main", "task"]);
  });

  it("handles Windows worktree names and empty lists", () => {
    const groups = groupSidebarThreads(
      [thread("windows", "app", "pc", "C:\\worktrees\\fix\\")],
      projectFor,
      environmentLabel,
    );
    expect(groups[0]?.worktrees[0]?.label).toBe("fix");
    expect(groupSidebarThreads([], projectFor, environmentLabel)).toEqual([]);
  });
});
