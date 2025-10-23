import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { Code, Home, Sparkles } from "lucide-react"
import { FaRunning } from "react-icons/fa"
import { AppSidebarUser } from "./AppSidebarUser"
import { AppSidebarTitle } from "./AppSidebarTitle"

const navigation = [
    {
        name: "Home",
        url: "/",
        icon: Home,
    },
    {
        name: "Generate Plan",
        url: "/plan",
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
    avatar: "https://dgalywyr863hv.cloudfront.net/pictures/athletes/70856688/33152082/1/medium.jpg",
}

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <AppSidebarTitle />

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