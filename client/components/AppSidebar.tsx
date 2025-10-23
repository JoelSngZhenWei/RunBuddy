import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { Code, Home, Sparkles } from "lucide-react"
import { FaRunning } from "react-icons/fa"
import { AppSidebarUser } from "./AppSidebarUser"

const navigation = [
    {
        name: "Home",
        url: "/",
        icon: Home,
    },
    {
        name: "Generate Plan",
        url: "/buddy",
        icon: Sparkles,
    },
    {
        name: "Code",
        url: "https://github.com/JoelSngZhenWei/RunBuddy",
        icon: Code,
    },
]

const user = {
    username: "joel_sng",
    id: 70856688,
    avatar: "https://dgalywyr863hv.cloudfront.net/pictures/athletes/70856688/33152082/1/medium.jpg", // placeholder avatar
}

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="">
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div className="bg-strava text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <FaRunning className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">Run Buddy</span>
                        <span className="truncate text-xs">An IS469 Project</span>
                    </div>
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((nav) => (
                                <SidebarMenuItem key={nav.name}>
                                    <SidebarMenuButton asChild>
                                        <a href={nav.url} target={nav.url.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer">
                                            <nav.icon className="mr-2 h-4 w-4" />
                                            <span>{nav.name}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <AppSidebarUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}