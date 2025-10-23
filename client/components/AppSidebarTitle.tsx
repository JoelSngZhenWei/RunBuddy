import { FaRunning } from "react-icons/fa";
import { SidebarHeader, SidebarMenuButton } from "./ui/sidebar";

export function AppSidebarTitle() {
    return (
        <SidebarHeader className="">
            <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
                <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <FaRunning className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Run Buddy</span>
                    <span className="truncate text-xs">An IS469 Project</span>
                </div>
            </SidebarMenuButton>
        </SidebarHeader>
    )
}