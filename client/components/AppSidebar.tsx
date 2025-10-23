import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar"
import { Code, Home, Sparkles } from "lucide-react"
import { AppSidebarTitle } from "./AppSidebarTitle"
import AppSidebarUserWrapper from "./AppSidebarUserWrapper"

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
        <Sidebar collapsible="icon" className="" variant="floating">
            <AppSidebarTitle />
            <SidebarContent className="">
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
                <AppSidebarUserWrapper />
            </SidebarFooter>
        </Sidebar>
    )
}