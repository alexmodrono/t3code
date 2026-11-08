import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  GitBranchIcon,
  PaletteIcon,
} from "lucide-react";
import { ProjectFavicon, type ProjectFaviconProject } from "../ProjectFavicon";
import { Button } from "../ui/button";
import { Tooltip, TooltipTrigger, TooltipPopup } from "../ui/tooltip";
import { cn } from "~/lib/utils";

export function SidebarThreadGroupHeader(props: {
  label: string;
  detail: string | null;
  count: number;
  expanded: boolean;
  worktree?: boolean;
  project?: ProjectFaviconProject | undefined;
  onCustomize?: (() => void) | undefined;
  onToggle: () => void;
}) {
  const Chevron = props.expanded ? ChevronDownIcon : ChevronRightIcon;
  const Icon = props.worktree ? GitBranchIcon : FolderIcon;
  return (
    <li
      className={cn(
        "flex list-none items-center gap-0.5 pt-2",
        props.worktree && "ml-3 border-l border-sidebar-border pl-1",
      )}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-expanded={props.expanded}
              aria-label={`${props.label}, ${props.count} threads`}
              onClick={props.onToggle}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-sidebar-muted-foreground hover:bg-sidebar-row-hover hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-ring"
            />
          }
        >
          <Chevron aria-hidden className="size-3 shrink-0" />
          {props.project && (props.project.projectIcon || props.project.faviconPath) ? (
            <ProjectFavicon project={props.project} className="size-4 shrink-0" />
          ) : (
            <Icon aria-hidden className="size-3.5 shrink-0" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{props.label}</span>
            {props.detail ? (
              <span className="block truncate text-2xs opacity-70">{props.detail}</span>
            ) : null}
          </span>
          <span className="shrink-0 tabular-nums opacity-60">{props.count}</span>
        </TooltipTrigger>
        <TooltipPopup side="right">
          {props.label}
          {props.detail ? ` · ${props.detail}` : ""}
        </TooltipPopup>
      </Tooltip>
      {props.onCustomize ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost-muted"
                size="icon-xs"
                aria-label={`Change folder icon and color for ${props.label}`}
                onClick={props.onCustomize}
              />
            }
          >
            <PaletteIcon aria-hidden className="size-3.5" />
          </TooltipTrigger>
          <TooltipPopup side="right">Change folder icon and color</TooltipPopup>
        </Tooltip>
      ) : null}
    </li>
  );
}
