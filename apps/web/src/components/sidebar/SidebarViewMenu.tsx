import { ListTreeIcon } from "lucide-react";
import { updateClientSettings, useClientSettings } from "../../hooks/useSettings";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuCheckboxItem,
} from "../ui/menu";
import { SidebarHeaderIconButton } from "./SidebarThreadHeader";

export function SidebarViewMenu() {
  const grouping = useClientSettings((settings) => settings.sidebarThreadGrouping);
  const titleFirst = useClientSettings((settings) => settings.sidebarTitleFirst);
  return (
    <Menu>
      <MenuTrigger render={<SidebarHeaderIconButton label="Sidebar view" />}>
        <ListTreeIcon className="size-4" />
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuRadioGroup
          value={grouping}
          onValueChange={(value) => {
            if (value === "flat" || value === "project" || value === "worktree") {
              void updateClientSettings({ sidebarThreadGrouping: value });
            }
          }}
        >
          <MenuRadioItem value="flat">Flat</MenuRadioItem>
          <MenuRadioItem value="project">Group by project</MenuRadioItem>
          <MenuRadioItem value="worktree">Group by project and worktree</MenuRadioItem>
        </MenuRadioGroup>
        <MenuSeparator />
        <MenuCheckboxItem
          checked={titleFirst}
          onCheckedChange={(checked) => {
            void updateClientSettings({ sidebarTitleFirst: checked });
          }}
        >
          Title-first threads
        </MenuCheckboxItem>
      </MenuPopup>
    </Menu>
  );
}
